var util = require("util");
var net = require('net');
var telnet=require('./telnet.js')
var Component=require('./Component');
var ansiParser=require('./ansiParser');
var TelnetSocket=telnet.Socket;
var Connect=function(host,port,charset){
  Component.call(this);
  this.host=host;
  this.port=port;
  this.charset=charset;
  this.connected=false;
  this.socket=null;
};
util.inherits(Connect,Component);
Connect.prototype.onConnect=function()
{
  this.connected=true;
  this.emit('connected');
}
Connect.prototype.onDisconnect=function()
{
  this.connected=false;
  this.emit('disconnected');
}
Connect.prototype.parserResult=function(data)
{
  var ansi=new ansiParser(this.charset);
  var result=ansi.parser(data);
  this.emit('result',result);
}
Connect.prototype.send=function(cmd)
{
  if (this.connected){this.rawSocket.write(ansiParser.encodeCmd(cmd,this.charset))+'\r\n';}
}
Connect.prototype.connect=function()
{
  if (!this.connected)
  {
              var conn=this;            
              var rawSocket=this.rawSocket=net.connect({port:this.port,host:this.host},function() {
                  var telnet=conn.socket= new TelnetSocket(rawSocket,rawSocket);
                  conn.onConnect();
                  rawSocket.on('end',function(){conn.onDisconnect()});
                  rawSocket.on('close',function(){conn.onDisconnect()});
                  telnet.on('data',function(data){conn.parserResult(data);});
            });
            rawSocket.on('error',function(err){conn.emit('connectError',err)});
  }
}
Connect.prototype.disconnect=function()
{
    if (this.connected)
    {
      this.socket.destroy();
      this.rawSocket.end();
      this.rawSocket.destroy();      
      this.socket=null;
      this.rawSocket=null;
    }
}
module.exports=Connect;
