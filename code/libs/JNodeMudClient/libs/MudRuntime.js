var Client=require('JNodeMudClient');
var Runtime=function(runtimepath){
 var express = require('express')
  , app = express();
  this.app=app;
  app.set('view engine', 'ejs');
  app.set('views', runtimepath+'/views');  
  this.path=runtimepath;
  var http = require('http')
  , server = http.createServer(app);
  this.server=server;
  var socketio=require('socket.io');  
  this.io=socketio.listen(server);  
  app.use('/assets',express.static(this.path + '/assets'));    ;
  server.listen(8080);
  app.use(express.static(this.path + '/assets'));
}
module.exports=Runtime;
