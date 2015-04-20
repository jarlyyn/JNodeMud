var Cmd={}
Cmd['connect']=function(client,value){value?client.conn.connect():client.conn.disconnect();}
var Status={}
Status['connect']=function(client){client.ui.status('connect',client.conn.connected);}


module.exports.Cmd=Cmd;
module.exports.Status=Status;