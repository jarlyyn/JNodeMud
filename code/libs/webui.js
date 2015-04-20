var Express=require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var ui=function(app){
  var customValidators={
    isUniqueClient:function(value)
    {
      return !app.hasClient(value);
    }
  };
  var express=Express();
  var server = require('http').Server(express);
  express.use(Express.static(__dirname+'/../themes/default'));
  express.use(bodyParser.urlencoded({extended:true}));
  express.use(expressValidator({customValidators:customValidators}));
  express.post('/system/createClient',function(req,res,net){
    req.checkBody('create-client-form-id','名称必填').notEmpty();
    req.checkBody('create-client-form-id','名称重复').isUniqueClient();
    req.checkBody('create-client-form-host','服务器必填').notEmpty();
    req.checkBody('create-client-form-port','端口必填').notEmpty();
    req.checkBody('create-client-form-port','端口必须是整数').isInt();
    req.sanitize('create-client-form-port').toInt();
    req.checkBody('create-client-form-charset','编码必填').notEmpty();
    if (req.validationErrors()==null){
      app.createClient(req.body['create-client-form-id'],
                        {
                         host:req.body['create-client-form-host'],
                         port:req.body['create-client-form-port'],
                         charset:req.body['create-client-form-charset'],
                        });
    }
    res.json({errors:req.validationErrors()});
  });
  express.get('/currentClient/settings',function(req,res,next){
    res.json(app.getCurrentClientSettings());
  });
  express.post('/currentClient/update',function(req,res,next){
  if (app.currentClient==null){return res.json({errors:null})};        
    req.checkBody('create-client-form-host','服务器必填').notEmpty();
    req.checkBody('create-client-form-port','端口必填').notEmpty();
    req.checkBody('create-client-form-port','端口必须是整数').isInt();
    req.sanitize('create-client-form-port').toInt();
    req.checkBody('create-client-form-charset','编码必填').notEmpty(); 
    if (req.validationErrors()==null){
      app.updateCurrentClientConfig(
                        {
                         host:req.body['create-client-form-host'],
                         port:req.body['create-client-form-port'],
                         charset:req.body['create-client-form-charset'],
                        });
    }
    res.json({errors:req.validationErrors()});
    
  });
  this.mudApp=app;
  this.server=server;
  this.express=express;
}
module.exports=ui;