var requireTest=require('requiretest.js');
echo('test echo function');
//console.log('test console');
triggers.add('hi','^ 你是(?<born>.*)，天性(?<nature>.*)，(?<master>.*)$',{
  callback:function(match){
    echo('callback');
    echo(util.inspect(match));
    send('l');
  }
});
requireTest();
//require('hi.js');