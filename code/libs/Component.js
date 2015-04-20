var util = require("util");
var events = require('events');
var Component=function()
{
      events.EventEmitter.call(this);  
}
util.inherits(Component,events.EventEmitter);
module.exports=Component;