var XRegExp = require('xregexp');
var Trigger=function()
{
  this.pattern=null
  this.regexp=null;
  this.enabled=null;
  this.models={};
}
Trigger.prototype.setPattern=function(pattern)
{
  this.pattern=pattern;
  this.updateRegexp();
}
Trigger.prototype.updateRegexp=function()
{
  this.regexp=new RegExp(this.pattern,);
}
module.exports=Trigger;