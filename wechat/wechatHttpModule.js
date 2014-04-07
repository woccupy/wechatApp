/*
This httpModule is responsible for handling the wechat
http request.
*/
var defaultPath = "/wechat/";
var authToken = "wechat";
var httpModule = require("../HttpProcessModule");
var util = require("util");
var url = require('url');
var wechatUtil = require('./util')
var querystring = require('querystring');
var xmlreader = require("xmlreader");
var igon = ["attributes", "parent", "count", "at", "each", "text"];

//默认过滤请求类型
require('../MessageModule')
exports.eventManager = require('../MessageModule').getMessageManager();

var sessions = {};

function WechatHttpModule()
{
    this.req = null;
    this.res = null;
    this.session = null;
    this.userMsg = null;
    this.toUserText = "";

    this.processRequest = function (req, res)
    {
        this.res = res;
        this.req = req;
        this.query = querystring.parse(req.url.split("?")[1]);
        if (this.req.method == "GET")
        {
            this.doGet();
        }
        else
        {
            this.body = '';
            this.req.setEncoding('utf8');
            this.req.addListener('data', function (chunk)
            {
                this.body += chunk;
            } .bind(this));
            this.req.addListener('end', this.doPost.bind(this));
        }
    }

    this.appendRenderText = function (text)
    {
        if (this.toUserText !== "")
            this.toUserText += "\n"+text;
        else
            this.toUserText += text;
    }

    this.doGet = function ()
    {
        if (this.checkSignature())
        {
            this.res.end(this.query.echostr);
        }
        else
        {
            this.res.end("signature error");
        }
    }
    // to check whether the request is illegal.
    this.checkSignature = function ()
    {
        var path = url.parse(this.req.url).pathname;
        var params = [authToken, this.query.timestamp, this.query.nonce];
        var signature = this.query.signature;
        params = params.sort();
        var temp = params[0] + params[1] + params[2];
        var crypto = require('crypto');
        var sha1 = crypto.createHash('sha1');
        sha1.update(temp)
        var hex = sha1.digest('hex');
        return (hex === signature);
    }

    this.setSession = function (userID)
    {
        if (sessions[userID] === undefined)
        {
            sessions[userID] = {};
        }
        this.session = sessions[userID];
    }

    this.gotoStatus = function (status)
    {
        this.session["status"] = status;
        this.userMsg.Content = "";
        this.distributeMsg();
    }

    this.distributeMsg = function ()
    {
        //set the default status.
        if (this.session["status"] === undefined)
        {
            this.session["status"] = exports.getStatusMgr().getDefaultStatus();
        }
        console.log(this.session["status"]);
        var messages = wechatMessManager[this.session["status"]]
        if (messages === undefined)
            return;

        var defaultMessage = null;
        for (var i in messages)
        {
            var item = messages[i];

            if (item.matchReg != null &&
               item.matchReg.test(this.userMsg.Content)
               )
            {
                exports.eventManager.emit(item.event, this);
                return;
            }
            else if (item.matchMethod && item.matchMethod(this.userMessage.Content))
            {
                exports.eventManager.emit(item.event, this);
                return;
            }
            if (item.matchMethod == null && item.matchReg == null)
            {
                defaultMessage = item;
            }
        }
        if (defaultMessage)
            exports.eventManager.emit(defaultMessage.event, this);

    }

    this.renderMessage = function ()
    {
        var render = new wechatUtil.Output(this.userMsg);
        var xml = render.text(this.toUserText);
        this.res.writeHead(200, { 'Content-Type': 'text/xml' });
        this.res.end(xml);
    }

    this.doPost = function ()
    {
        xmlreader.read(this.body, function (errors, response)
        {
            if (null !== errors)
            {
                return;
            }
            var msg = {};
            for (var k in response.xml)
            {
                if (igon.indexOf(k) == -1)
                {
                    if (response.xml[k] && response.xml[k].text)
                    {
                        msg[k] = response.xml[k].text.call();
                    }
                }
            }
            this.setSession(msg.FromUserName);
            this.userMsg = msg;
            this.distributeMsg();
        } .bind(this));
    }
}

WechatHttpModule.isMatched = function (req, res)
{
    path = url.parse(req.url).pathname;
    if (path.indexOf(defaultPath) > -1)
    {
        return true
    }
    return false;
}

util.inherits(WechatHttpModule, httpModule.HttpModule);
httpModule.registerHttpModule("wechat", WechatHttpModule);


exports.WechatMessage = function ()
{
    this.event = "";
    this.currentStatus = "";
    this.matchReg = null;
    this.matchMethod = null;
}
var wechatMessManager = {};

exports.registerMessage = function (message)
{
    if (!message instanceof exports.WechatMessage)
        console.log("the message is an illegal message.")
    if (wechatMessManager[message["currentStatus"]] == undefined)
    {
        wechatMessManager[message["currentStatus"]] = [];
    }
    wechatMessManager[message["currentStatus"]].push(message);
}

function StatusManager()
{
    var wechatStatus = [];
    var wechatStatusDic = {};
    var defaultStatus = "";
    this.registerStatus = function (status)
    {
        if (wechatStatusDic[status])
            return;
        wechatStatus.push(status);
        wechatStatusDic[status] = {};
    }
    this.setDefaultStatus = function (status)
    {
        if (wechatStatusDic[status])
        {
            defaultStatus = status;
        }
    }
    this.getDefaultStatus = function ()
    {
        return defaultStatus;
    }
}
var wechatStatus = new StatusManager();

exports.getStatusMgr = function ()
{
    return wechatStatus;
}



//require the wechat related components.

exports.WechatComponent = function ()
{
    this.init = function () { }
}
var componentManager = [];
exports.registerComMgr = function (input)
{
    if (input == undefined
  && !input instanceof Function
  )
        return;
    var curItem = new input();
    curItem.init();
    componentManager.push(input);
}
require("./wechatComponent");



