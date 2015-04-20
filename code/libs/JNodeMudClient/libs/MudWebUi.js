var util = require("util");
var Component=require('./Component');
var WebUI=function(client)
{
  var self=this;
  Component.call(this);
  this.client=client;
  this.io=client.runtime.io;
  this.io.of('/'+client.id).on('connection',function(socket){self.initSocket.call(self,socket)});
}
util.inherits(WebUI,Component);
WebUI.prototype.initSocket=function(socket)
{
    socket.webui=this;
    socket.on('send',function(data){socket.webui.emit('send',data)});
    socket.on('cmd',function(data){socket.webui.emit('cmd',data)});
    socket.webui.emit('uiConnected');
}
WebUI.prototype.displayCmds=function(data)
{
  this.io.of('/'+this.client.id).emit('displayCmds', data);
}
WebUI.prototype.status=function(name,value)
{
  this.io.of('/'+this.client.id).emit('status', {name:name,value:value});
}
module.exports=WebUI;

