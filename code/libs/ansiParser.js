var iconv = require('iconv-lite');
var Result=function(charset){
  this.charset=charset;
  //this.plainLines=[];
  this.currentPlainCharLine=[];
  this.currentData=[];
  //this.rawDatas=[];
  this.lines=[];
  this.CurrentValueCharLine=[];
}
Result.prototype.saveLine=function()
{
  if (this.currentPlainCharLine.length)
  {
    var line=this.currentPlainCharLine.join('');
    this.lines.push({
      plainLines:line,
      rawDatas:this.currentData,
    })
    //this.plainLines.push(line);
    //this.rawDatas.push(this.currentData);
    this.currentData=[];
    this.currentPlainCharLine=[];
  }
}
Result.prototype.pushText=function(text)
{
  this.currentPlainCharLine.push(text);
}
Result.prototype.pushChar=function(char)
{
  this.CurrentValueCharLine.push(char);
}
Result.prototype.CleanValue=function()
{
  this.CurrentValueCharLine=[];
}
Result.prototype.saveCmd=function(cmd)
{
  if (cmd || this.CurrentValueCharLine.length)
  {
    var value=iconv.decode(new Buffer(this.CurrentValueCharLine),this.charset);
    this.currentData.push({
      'cmd':cmd,
      'value':value,
    });
    if (cmd==null){this.pushText(value)};
    if (cmd==10){this.saveLine()};
    if (cmd==100 || cmd==68){this.currentPlainCharLine=[];}
    this.CurrentValueCharLine=[];
  }
}
var ansiBuffer=function(charset){
  this.charset=charset;
  this.hook=ansiBuffer.prototype.hookStandard;
}
ansiBuffer.prototype.parser=function(buffer)
{
  var word,hook,self;
  var result=new Result(this.charset);
  this.hook=ansiBuffer.prototype.hookStandard;
  for (var i = 0; i < buffer.length ; i++)
  {
    word=buffer[i];
    hook=this.hook[word];
    this.hook[word]?this.hook[word].call(this,result,word):this.hook[null].call(this,result,word);
  }
  result.saveCmd(null);
  result.saveLine();
  return result;  
}
ansiBuffer.prototype.hookStandard={
  13:function(result,char){result.saveCmd(null);result.pushChar(char);this.hook=ansiBuffer.prototype.hookAfterCr},
  27:function(result,char){result.saveCmd(null);result.pushChar(char);this.hook=ansiBuffer.prototype.hookAfterSign},
  null:function(result,char){result.pushChar(char);},
}
ansiBuffer.prototype.hookAfterCr={
    10:function(result,char){result.saveCmd(10)},
    27:function(result,char){result.saveCmd(null);result.pushChar(char);this.hook=ansiBuffer.prototype.hookAfterSign},    
    null:function(result,char){result.pushChar(char);this.hook=ansiBuffer.prototype.hookStandard},
}
ansiBuffer.prototype.hookAfterSign={
  91:function(result,char){result.CleanValue();this.hook=ansiBuffer.prototype.hookCmdValue},
  null:function(result,char){result.pushChar(char);this.hook=ansiBuffer.prototype.hookStandard},
}
var hc=ansiBuffer.prototype.hookCmdValue={}
var hcValueHook=function(result,char){result.pushChar(char);};
//1234567890
for (var i =48;i<58;i++){hc[i]=hcValueHook;}
hc[59]=hcValueHook;
var hcCmdHook=function(result,char){result.saveCmd(char);this.hook=ansiBuffer.prototype.hookStandard};
//abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
for (var i =65;i<91;i++){hc[i]=hcCmdHook;}
for (var i =97;i<123;i++){hc[i]=hcCmdHook;}
hc[null]=function(result,char){result.pushChar(char);this.hook=ansiBuffer.prototype.hookStandard}

ansiBuffer.prototype.newcmd=function()
{
  this.cmd=new Cmd();
  this.cmdlist.push(this.cmd);
}
ansiBuffer.prototype.addText=function(word)
{
  this.cmd.addText(word);
}
var encodeCmd=function(cmd,charset)
{
  return iconv.encode(cmd+'\r\n',charset);
}
module.exports=ansiBuffer;
module.exports.encodeCmd=encodeCmd;