var util = require("util");
var config=require('./config');
var clientConfig=config.clients;
var MudConnect=require('./MudConnect'); 
var Component=require('./Component');
var _=require('lodash');
var moment=require('moment');
var Client=function(app,id,config)
{
  Component.call(this);
  this.app=app;
  this.id=id;
  this.config=config;
  this.createConnect();
  this.buffer=[];
  this.maxBuffer=2000;
  this.logCmd=true;
}
util.inherits(Client,Component);
Client.prototype.destory=function()
{
  if (this.conn)
  {
    //this.conn.end();
    this.conn.removeAllListeners();
    delete this.conn;
  }
  this.emit('destory',this);
  this.removeAllListeners();
}
Client.prototype.createConnect=function()
{
  delete this.conn;
  var client=this;
  this.conn=new MudConnect(this.config.host,this.config.port,this.config.charset);
  this.conn.on('result',function(data){client.onResult(data)});
  this.conn.on('connectError',function(err){client.netErrorMsg(err)});
  this.conn.on('connected',function(){client.netConnectMsg();client.emit('connected',this)});
  this.conn.on('disconnected',function(){client.netDisconnectMsg();client.emit('disconnected',this)});
}
Client.prototype.updateConfig=function(config)
{
  this.config=config;
  if (this.conn)
  {
    if (config.host){this.conn.host=config.host;}
    if (config.port){this.conn.port=config.port;}
    if (config.charset){this.conn.charset=config.charset;}
  }
}
Client.prototype.getConfig=function()
{
  return this.config;
}
Client.prototype.connect=function()
{
  this.conn.connect();
}
Client.prototype.disconnect=function()
{
  this.conn.disconnect();
}
Client.prototype.netErrorMsg=function(err)
{
  this.echoErrorMsg('网络错误:'+err.code);
}
Client.prototype.netDisconnectMsg=function()
{
  this.echo('Disconnect from '+this.config.host+':'+this.config.port + ' at '+moment().format('YYYY-MM-DD,HH:mm:ss')+'.');
}
Client.prototype.netConnectMsg=function()
{
  this.echo('Connect to '+this.config.host+':'+this.config.port + ' at '+moment().format('YYYY-MM-DD,HH:mm:ss')+'.');
}
Client.prototype.echoErrorMsg=function(msg)
{
  this.echo(msg,'red');
}
Client.prototype.echo=function(value,color)
{
      var data={
      rawDatas:[
      {
        cmd:68,
        value:0,
      },
      {
        cmd:null,
        value:value,
      },
      {
        cmd:10,
        value:'',
      }
      ],
      plainLines:value,
    };
    this.output(data);
}
Client.prototype.send=function(cmd)
{
  this.conn.send(cmd);
  if (this.logCmd)
  {
    this.echo(cmd);
  }
}
Client.prototype.onResult=function(data)
{
  for ( var i in data.lines)
  {
    this.output(data.lines[i]);
  }
}
Client.prototype.output=function(data)
{
  this.buffer.push(data);
  if (this.buffer.length>this.maxBuffer){this.buffer.shift()};
  this.emit('clientResult',{client:this,data:data});
}
var MudApp=function()
{
  Component.call(this);  
  this.clients={};
  this.currentClient=null;
  var app=this;
  this.loadClients();
  this.on('clientResult',function(data){
    if (app.currentClient && data.client.id==app.currentClient.id)
    {
      app.emit('currentClientResult',data.data);
    }
  })
}
util.inherits(MudApp,Component);
MudApp.prototype.loadClients=function()
{
  var data=clientConfig.getData();
  for (var id in data)
  {
    this.loadClient(id,data[id]);
  }
}
MudApp.prototype.getCurrentClientSettings=function(id)
{
  if (this.currentClient==null){return null};
  var client=this.currentClient;
  return {host:client.config.host,port:client.config.port,charset:client.config.charset,};
}
MudApp.prototype.clientConnect=function(id)
{
  if (this.clients[id])
  {
    this.clients[id].connect();    
  }
}
MudApp.prototype.createClient=function(id,config)
{
 if (this.clients[id]==null)
 {
  clientConfig.set(id,config);
  clientConfig.save();
  this.loadClient(id,config);
  this.setCurrentClient(id);
 }
 return this.clients[id]; 
}
MudApp.prototype.removeCurrentClient=function()
{
  if (this.currentClient!=null)
  {
    clientConfig.delete(this.currentClient.id);
    clientConfig.save();
    delete this.clients[this.currentClient.id];
    this.currentClient.destory();
    this.setCurrentClient(null);
    this.updateClients();
  }
}
MudApp.prototype.updateCurrentClientConfig=function(config)
{
if (this.currentClient!=null)
 {
  this.currentClient.updateConfig(config);
  clientConfig.set(this.currentClient.id,this.currentClient.getConfig());
  clientConfig.save();
 }
 return this.currentClient;   
}
MudApp.prototype.bindClient=function(client)
{
  var app=this;
  client.on('connected',function(client){
    app.updateClients();
    if (client.id=app.currentClient.id){app.updateCurrent()}
  });
  client.on('disconnected',function(client){
    app.updateClients();
    if (client.id=app.currentClient.id){app.updateCurrent()}    
  });
  client.on('clientResult',function(data){app.emit('clientResult',data)})
}
MudApp.prototype.loadClient=function(id,config)
{
 if (this.clients[id]==null)
 {
  this.clients[id]=new Client(this,id,config);
  this.bindClient(this.clients[id]);
 }
 this.updateClients();
 return this.clients[id];
}
MudApp.prototype.queryClients=function()
{
  
  return _.mapValues(this.clients,function(value){
    return {
      id:value.id,
      host:value.config.host,
      port:value.config.port,
      connected:value.conn.connected,
      status:false
    }
  });
}
MudApp.prototype.hasClient=function(id)
{
  return this.clients[id]!=null;
}
MudApp.prototype.updateClients=function()
{
  this.emit('updateClients',this.queryClients());
}
MudApp.prototype.updateCurrent=function()
{
  var currentInfo=(this.currentClient==null)?null:{
    id:this.currentClient.id,
    connected:this.currentClient.conn.connected,
    host:this.currentClient.config.host,
    port:this.currentClient.config.port,
  };
  this.emit('updateCurrent',currentInfo);
}
MudApp.prototype.queryCurrentBuffer=function()
{
  if (this.currentClient)
  {
    var client=this.currentClient;
    return {max:client.maxBuffer,lines:client.buffer};
  }
}
MudApp.prototype.setCurrentClient=function(id)
{
  if (id==null || this.clients[id])
  {
    if (this.currentClient==null && id!=null ||this.currentClient.id!=id){this.emit('currentClientChanged',id);}
    this.currentClient=(id!=null)?this.clients[id]:null;
    this.updateCurrent();
  }
}
MudApp.prototype.sendToCurrent=function(cmd)
{
  if (this.currentClient)
  {
    this.currentClient.send(cmd);
  }
}
module.exports.client=Client;
module.exports.app=MudApp;