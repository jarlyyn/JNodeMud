var XRegExp = require('xregexp').XRegExp;
var Trigger=function(pattern,settings)
{
  this.regexp=null;  
  this.setPattern(pattern);
  this.enabled=true;
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
  return this.regexp?XRegExp.exec(str,this.regexp):null;
}
module.exports=Trigger;