  var HTMLescaper=function()
  {
    this.DOMnative=document.createElement("span");
    this.DOMtext = document.createTextNode("");
    this.DOMnative.appendChild(this.DOMtext);
  }
  HTMLescaper.prototype.escape=function(html){this.DOMtext.nodeValue = html;return this.DOMnative.innerHTML};
  var LineBuilder=function()
  {
    this.currentLine='';
    this.HTMLescaper=new HTMLescaper();
    this.colorReset();
  }
  LineBuilder.prototype.exec=function(cmds)
  {
    var cmd;
    this.line=null;
    for (var i in cmds)
    {
      cmd=cmds[i].cmd;
      if (this.fn[cmd]){this.fn[cmd].call(this,cmds[i].value);}
    }
    return this.line;
  }
  LineBuilder.prototype.lineFinish=function()
  {
    this.line=this.currentLine;
    this.currentLine='';
  }
  LineBuilder.prototype.appendText=function(text)
  {
    var htmlclass='';
    if (this.color){htmlclass+='ansi-';htmlclass+=this.color+'-fg '};
    if (this.bgcolor){htmlclass+='ansi-';htmlclass+=this.bgcolor+'-bg'};
    this.currentLine+='<span class="'+htmlclass+'">'+this.HTMLescaper.escape(text)+'</span>';
  }
  LineBuilder.prototype.fn={};
  LineBuilder.prototype.fn[10]=function(value){;this.lineFinish()};
  LineBuilder.prototype.fn[77]=LineBuilder.prototype.fn[109]=function(value){
    var colors=value.split(';'),color;
    var bright=false;
    for (var i in colors)
    {
      color=colors[i];
      if (color=='1'||color=='01'){bright=true;continue;};
      if (color.length==2)
      {
	colorCode=this.colors[color[1]];
	if (color[0]=='3' && colorCode){this.color=(bright?'bright-':'')+colorCode;continue;};
	if (color[0]=='4' && colorCode){this.bgcolor=(bright?'bright-':'')+colorCode;continue;};
      }
      bright=false;
      this.colorReset();
    }
  };
  LineBuilder.prototype.fn[68]=LineBuilder.prototype.fn[100]=function(value){this.currentLine='';};
  LineBuilder.prototype.fn[null]=function(value){this.appendText(value)};
  LineBuilder.prototype.colorReset=function(){this.color=null;this.bgcolor=null;}
  LineBuilder.prototype.colors={'0':'black','1':'red','2':'greed','3':'yellow','4':'blue','5':'magenta','6':'cyan','7':'white'};
  LineBuilder.prototype.getPrompt=function(){
      return this.currentLine;
  }
  LineBuilder.prototype.clearPrompt=function()
  {
      this.currentLine='';
  }