var util = require("util");
var Component=require('./Component'); 
var MudWebUi=require('./MudWebUi'); 
var MudConnect=require('./MudConnect'); 
var Cmd=require('./MudClientCmd').Cmd; 
var Status=require('./MudClientCmd').Status; 
//conn=new mud.conn('218.63.52.205','8888');
//conn=new mud.conn('pkuxkx.net','8080');
var Client=function(runtime,id)
{
  Component.call(this);  
  var client=this;
  this.id=id;
  this.runtime=runtime;
  this.app=app=runtime.app;
  this.appPath=runtime.path;
  this.conn=new MudConnect('218.63.52.84',2000,'GBK');
  this.conn.on('result',function(result){client.onResult(result)});
  this.conn.on('connected',function(){client.onConnected()});
  this.conn.on('disconnected',function(result){client.onDisconnected()});
  app.get('/'+this.id, function (req, res) {
    res.render('client',{'id':client.id});
  });
  this.ui=new MudWebUi(this);  
  this.ui.on('send',function(cmd){client.send(cmd)});
  this.ui.on('cmd',function(data){client.onCmd(data)});
  this.ui.on('uiConnected',function(){client.onUiConnected()});
}
util.inherits(Client,Component);
Client.prototype.send=function(cmd)
{
      this.conn.send(cmd);
}
Client.prototype.onCmd=function(data)
{
  cmdname=data['cmd']
  console.log(data);
  console.log(Cmd);
  if (Cmd[cmdname])
  {
    Cmd[cmdname](this,data['value']);
  }
}
Client.prototype.onConnected=function()
{
  console.log('c');
  Status['connect'](this);
}
Client.prototype.onDisconnected=function()
{
  console.log('d');
  Status['connect'](this);
}
Client.prototype.onUiConnected=function()
{
  for (var i in Status)
  {
    Status[i](this);
  }
}
Client.prototype.onResult=function(result)
{
  		lines=result.plainLines;
		if (lines.length)
		{
		  prompt=lines.pop();
		  for (var i in lines){};
		  if(prompt.length){}
		}
		var Cmds=[];
		for (var i in result.rawDatas){Cmds=Cmds.concat(result.rawDatas[i])};
		this.ui.displayCmds(Cmds);
}

module.exports=Client;