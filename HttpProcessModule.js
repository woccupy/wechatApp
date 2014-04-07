/*
HttpProcessModule is hooked on the HttpServer.
*/
var util = require("util");
var loadModuleError="the registed module %s is not valid module."
var error_notExist="-_-!!!,您访问的页面不存在.";


exports.HttpModule = function ()
{
    
    this.processRequest = function ()
    {
     
    }
}

exports.HttpModule.isMatched = function ()
{
        return false;
}

httpModuleList = {};
exports.registerHttpModule = function (name, httpModule)
{
    if (new httpModule() instanceof exports.HttpModule)
    {
        httpModuleList[name] = httpModule;
    }
    
    else
    {
        console.log(util.format(loadModuleError,name));
    }
}
exports.processRequest = function (req, res)
{
    for (var name in httpModuleList)
    {
    	  if (httpModuleList[name].isMatched(req, res))
        {
            new httpModuleList[name]().processRequest(req, res);
            return;
        }
    }
}

HttpModuleDefault = function ()
{

    this.processRequest = function (req, res)
    {
        res.writeHead(200, 
        {
            'Content-Type': 'text/plain; charset=utf-8'
        }
        );
        res.end(error_notExist);
        return;
    }
}

HttpModuleDefault.isMatched = function (req, res)
{
        return true;
}
util.inherits(HttpModuleDefault,exports.HttpModule);

// load the wechat Module.
require("./wechat/wechatHttpModule");
//register the default handlere.
exports.registerHttpModule ("default",HttpModuleDefault)






