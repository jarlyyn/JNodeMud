var App=require('./libs/mudclient').app;
var config=require('./libs/config');
// var io=require('socket.io-client');
var Webui=require('./libs/webui');
var Api=require('./libs/socketIOApi');

var app=new App()
webui=new Webui(app);
var api=new Api(webui);
webui.server.listen(config.system.get('port'));