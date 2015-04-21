var vm = require('vm');
var path=require('path');
var fs=require('fs');
var MudClientVm=function(client,name)
{
  this.client=client;
  this.name=name;  
  this.path=path.resolve(client.app.getScriptPath(name));
  this.loaded=false;
  this.loadConfig();
  if (this.config==null || this.config.script==null)
  {
    this.errorMsg('配置文件加载失败。')
    return;
  }
  this.buildApi();
  this.createSandBox();  
  this.require(this.config.script);
}
MudClientVm.prototype.errorMsg=function(msg)
{
  this.client.echoErrorMsg(msg);
}
MudClientVm.prototype.loadConfig=function(){
    var path=this.path+'/package.json';
    try {  
      var data=fs.readFileSync(path);
    }catch (err)
    {
      console.log(err);
      this.errorMsg('无法打开'+path);
      return null;
    }
    try{
      return this.config=JSON.parse(data);
    }
    catch (err)
    {
        this.errorMsg(path+'不是一个有效的json文件');
        return this.config= null;
    }        
}
MudClientVm.prototype.createSandBox=function()
{
  this.context=vm.createContext(this.sandbox);
  return this.sandbox;
}
MudClientVm.prototype.buildApi=function()
{
  this.module={};  
  var sandbox=this.sandbox={};
  var vm=this;
  sandbox.module=this.module;
  sandbox.require=function(){vm.require.apply(vm,arguments)};
  sandbox.module.require=sandbox.require;
  sandbox.echo=function(){vm.client.msg.apply(vm.client,arguments)};
}
MudClientVm.prototype.require=function(filename)
{
    var path=this.path+'/'+filename;
    try {  
      var data=fs.readFileSync(path);
    }catch (err)
    {
      console.log(err);
      this.errorMsg('无法打开'+path);
      return null;
    }
    try{
      this.client.msg('载入脚本:'+path);
      vm.runInContext(data,this.context,path);
    }
    catch (err)
    {
        this.errorMsg('错误['+err.name+']!');
        this.errorMsg(err.stack);
    }  
    
}
module.exports=MudClientVm;