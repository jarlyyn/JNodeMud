var XRegExp = require('xregexp').XRegExp;
var Trigger=function(pattern,settings)
{
  settings=settings||{};
  this.regexp=null;  
  this.setPattern(pattern);
  this.enabled=settings.enabled!=null?settings.enabled:true;
  this.group=settings.group!=null?settings.group:null;
  this.callback=settings.callback!=null?settings.callback:null;
  this.models={};
}
Trigger.prototype.setPattern=function(pattern)
{
  this.pattern=pattern;
  this.updateRegexp();
}
Trigger.prototype.updateRegexp=function()
{
  this.regexp=new XRegExp(this.pattern);
}
Trigger.prototype.exec=function(str)
{
  var result=this.regexp?XRegExp.exec(str,this.regexp):null;
  if (result==null){return null;}
  var callback=this.getCallback();
  if (callback){callback.call(null,result);}
  return result;
}
Trigger.prototype.getCallback=function()
{
  if (typeof this.callback=='function'){return this.callback}
}
module.exports=Trigger;