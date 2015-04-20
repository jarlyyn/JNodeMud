var util = require("util");
var Component=require('./Component'); 
var Config=function(){
  Component.call(this);
  this.host=null;
  this.port=null;
  this.charset='GBK';
}
util.inherits(Config,Component);
Module.exports=Config;