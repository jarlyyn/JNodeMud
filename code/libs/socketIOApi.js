var IO = require('socket.io');
var api=function(webui,config)
{
  var app=webui.mudApp;
  var server=webui.server;
  var io=IO(server);
  io.on('connection',function(socket){
    var _binded={};
    var bindApp=function(event,callback)
    {
      _binded[event]=callback;
      app.on(event,callback);
    }
    var unbindApp=function()
    {
      for (event in _binded)
      {
        app.removeListener(event,_binded[event]);
      }
    };
    socket.on('queryCurrent',function(){
      app.updateCurrent();
    });
    socket.on('sendToCurrent',function(line){
      app.sendToCurrent(line);
    });
    socket.on('toggleCurrentConnect',function(statue){
      var client=app.currentClient;
      if (client==null){return;}
      if (statue==null){statue=!client.conn.connected}
      
      if (statue){
        client.connect();
      }else{
        client.disconnect();
      }
    });    
    socket.on('setCurrentClient',function(id){
      app.setCurrentClient(id);
    });
    socket.on('clientConnect',function(id){
      app.clientConnect(id);      
    });
    socket.on('queryClients',function(){
      app.updateClients()
    });
    socket.on('createClient',function(data){
      app.createClient(data.id,data.config);
    });
    bindApp('currentClientResult',function(result){
      socket.emit('currentClientResult',result);
    });
    bindApp('currentClientChanged',function(id){
      socket.emit('currentClientChanged',id);
    });
    bindApp('updateCurrent',function(info){
      socket.emit('updateCurrent',info);
    });    
    bindApp('updateClients',function(clients){
      socket.emit('updateClients',clients);
    });    
    
    socket.on('queryCurrentBuffer',function(){
      socket.emit('updateBuffer',app.queryCurrentBuffer());
    });    
    socket.on('disconnect',function(){
      unbindApp();
    })
  });
}
module.exports=api;