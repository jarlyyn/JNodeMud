var vm = require('vm');
var path=require('path');
var fs=require('fs');
var util=require('util');
var Trigger=require('./mudclienttrigger');
var Model=require('./muddatamodel');
var MudClientScriptFramework=function(vm)
{
  this.vm=vm;
  this.triggers={}
}
MudClientScriptFramework.prototype.addTrigger=function(name,pattern,settings)
{
  this.triggers[name]=new Trigger(pattern,settings);
}
MudClientScriptFramework.prototype.setModel=function(name)
{
}

MudClientScriptFramework.prototype.getTriggersApi=function()
{
  var api={};
  var vm=this;
  api.add=function(){vm.addTrigger.apply(vm,arguments)};
  return api;
}
MudClientScriptFramework.prototype.exec=function(lines)
{
  var triggers=this.getEnabledTriggers();
  for(var i in lines)
  {
    for (var triggerName in triggers)
    {
    try{      
      var result=(triggers[triggerName].exec(lines[i].plainLines));
    }
    catch (err)
    {
        this.vm.errorMsg('错误['+err.name+']!');
        this.vm.errorMsg(err.stack);
    }
    }
  }
}
MudClientScriptFramework.prototype.getEnabledTriggers=function()
{
  return this.triggers;
}
var MudClientVm=function(client,name)
{
  this.client=client;
  this.name=name;
  this.framework=new MudClientScriptFramework(this);
  this.path=path.resolve(client.app.getScriptPath(name));
  this.loaded=false;
  this.loadConfig();
  if (this.config==null || this.config.script==null)
  {
    this.errorMsg('配置文件加载失败。')
    return;
  }
  this.createSandBox();    
  this.buildApi();
  this.require(this.config.script);
}
MudClientVm.prototype.exec=function(lines)
{
  this.framework.exec(lines);
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
  this.context=vm.createContext({});
}
MudClientVm.prototype.send=function(cmds)
{
  if (typeof cmds =='string'){
    this.sendToClient(cmds);
    return;
  }
  if (Array.isArray(cmds))
  {
    for(var i in cmds)
    {
      this.sendToClient(cmds[i]);      
    }
    return;
  }
  this.errorMsg(util.inspect(cmds)+'不是字符串或者Array');   
}
MudClientVm.prototype.sendToClient=function(cmds)
{
  if (typeof cmds =='string'){
    this.client.send(cmds);
    return;
  }
  this.errorMsg(util.inspect(cmds)+'不是字符串'); 
}
MudClientVm.prototype.buildApi=function()
{
  var sandbox=this.context;
  var vm=this;
  sandbox.util={};
  sandbox.util.inspect=function(){return util.inspect.apply(util,arguments)};
  sandbox.require=function(){return vm.require.apply(vm,arguments)};
  //sandbox.module.require=sandbox.require;
  sandbox.echo=function(){return vm.client.msg.apply(vm.client,arguments)};
  sandbox.send=function(){return vm.send.apply(vm,arguments)}
  sandbox.triggers=vm.framework.getTriggersApi();
}
MudClientVm.prototype.require=function(filename)
{
    var oldModule=this.context.module;
    var filepath=path.resolve(this.path+'/'+filename);
    if (filepath.indexOf(this.path)!=0)
    {
      this.errorMsg('错误：'+filepath+'不在脚本文件夹内');
      return null;
    }
    var newModule={};    
    try {  
      var data=fs.readFileSync(filepath);
    }catch (err)
    {
      this.errorMsg('错误：无法打开'+filepath);
      return null;
    }
    try{
      this.client.msg('载入脚本:'+filepath);
      this.context.module=newModule;
      vm.runInContext(data,this.context,filepath);
    }
    catch (err)
    {
        this.errorMsg('错误['+err.name+']!');
        this.errorMsg(err.stack);
    }
    this.context.module=oldModule;
    return newModule.exports;
}

module.exports=MudClientVm;