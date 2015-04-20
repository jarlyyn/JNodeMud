var JConfig=require('./JConfig');
var defaultConfig={
  port:2323,
}
var appConfig=new JConfig.ConfigFile(__dirname+'/../../config/jnodemud.json',defaultConfig);
var clients=new JConfig.ConfigFile(__dirname+'/../../config/clients.json',{});
module.exports.system=appConfig;
module.exports.clients=clients;
