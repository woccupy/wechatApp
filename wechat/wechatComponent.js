/*
This httpModule is responsible for handling the wechat
http request.
*/

//默认过滤请求类型
var wechat = require("./wechatHttpModule")
var sysUtil = require("util")

var statusManager = wechat.getStatusMgr();
var status = {};

status.visitor = "visitor";
statusManager.registerStatus(status.visitor);
statusManager.setDefaultStatus(status.visitor);
status.registered = "registered"
statusManager.registerStatus(status.registered);
status.logined = "logined"
statusManager.registerStatus(status.logined);

var componentEvent = {};

//region registerComponent
//the register component
componentEvent.register = "register";
componentEvent.help = "help";
registerComponent.registerReg = /^connect (.{2,20})$/i;
function registerComponent()
{
    this.messOK = "欢迎登陆 %s  企业首页。[微笑]";
    this.messError = "您的身份是访客.您当前可执行的操作:\n连接企业 [connect 企业名称]"
    this.init = function ()
    {
        wechat.eventManager.on(componentEvent.register, this.onRegisteEvent, this);
        wechat.eventManager.on(componentEvent.help, this.onHelpEvent, this);
    }
    this.onHelpEvent = function (httpContext)
    {
        httpContext.appendRenderText(this.messError);
        httpContext.renderMessage();
    }
    this.onRegisteEvent = function (httpContext)
    {
        var content = httpContext.userMsg.Content;
        var companyName = registerComponent.registerReg.exec(content)[1];
        httpContext.session["companyName"] = companyName;
        httpContext.appendRenderText(sysUtil.format(this.messOK, companyName));
        httpContext.gotoStatus(status.registered);
    }
}
sysUtil.inherits(registerComponent, wechat.WechatComponent);
wechat.registerComMgr(registerComponent);

var message = new wechat.WechatMessage();
message.currentStatus = status.visitor;
message.event = componentEvent.help;
wechat.registerMessage(message);

var message = new wechat.WechatMessage();
message.currentStatus = status.visitor;
message.event = componentEvent.register;
message.matchReg = registerComponent.registerReg;
wechat.registerMessage(message);
//endregion

// the login component
componentEvent.login = "componentEvent.login";
componentEvent.existCompany = "componentEvent.existCompany";
componentEvent.loginHelp = "componentEvent.loginHelp";
loginComponent.regLogin = /^([^ ]{1,10}) ([^ ]{1,10}) ([^ ]{1,10})$/i;
function loginComponent()
{
    this.messOK = "欢迎用户 %s 登陆到组织 %s[微笑]";
    this.messHelp = "您当前可以执行的操作: \n登陆系统:[姓名 密码 组织] \n退出当前企业:[exit]";
    this.messexit = "您已经退出当前企业.";
    this.init = function ()
    {
        wechat.eventManager.on(componentEvent.login, this.onLogin, this);
        wechat.eventManager.on(componentEvent.loginHelp, this.onLoginHelp, this);
        wechat.eventManager.on(componentEvent.exitCompany, this.onExisCompany, this);
    }
    this.onLogin = function (httpContext)
    {
        var content = httpContext.userMsg.Content;
        var matched = loginComponent.regLogin.exec(content);
        var name = matched[1], org = matched[3];
        httpContext.appendRenderText(sysUtil.format(this.messOK, name, org));
        httpContext.session["user"] = name;
        httpContext.session["org"] = org;
        httpContext.gotoStatus(status.logined);
    }
    this.onLoginHelp = function (httpContext)
    {
        httpContext.appendRenderText(this.messHelp);
        httpContext.renderMessage();
    }
    this.onExisCompany = function (httpContext)
    {
        httpContext.appendRenderText(this.messexit);
        httpContext.gotoStatus(status.visitor);
    }
}

sysUtil.inherits(loginComponent, wechat.WechatComponent);
wechat.registerComMgr(loginComponent);


var message = new wechat.WechatMessage();
message.currentStatus = status.registered;
message.event = componentEvent.login;
message.matchReg = loginComponent.regLogin;
wechat.registerMessage(message);

var message = new wechat.WechatMessage();
message.currentStatus = status.registered;
message.event = componentEvent.exitCompany;
message.matchReg = /^exit$/i;
wechat.registerMessage(message);


var message = new wechat.WechatMessage();
message.currentStatus = status.registered;
message.event = componentEvent.loginHelp;
wechat.registerMessage(message);



componentEvent.logined = "componentEvent.logined";
componentEvent.exitlogin = "componentEvent.exislogin";
componentEvent.joblist = "componentEvent.joblist";
componentEvent.approveJob = "componentEvent.approveJob";

loginedComponent.regJobList = /^joblist$/i;
loginedComponent.regApproval = /^(yes|no) ([^ ]{5,15})$/i;

function loginedComponent()
{
    this.messOK = "欢迎用户 %s 登陆到组织 %s[微笑]";
    this.messHelp = "您当前可以执行的操作: \n审批单据列表:[joblist] \n审批单据:[yes/no 单据号] \n退出系统:[exit]";
    this.messexit = "用户 %s,您已经退出当前系统";
    this.messList = "您有 三张单据 待审批, 单据号是: No121212, Nolsdkfjlk, No983498";
    this.messResult = "单据 %s 应经审核完毕.";

    this.init = function ()
    {
        wechat.eventManager.on(componentEvent.logined, this.onLoginedHelp, this);
        wechat.eventManager.on(componentEvent.exitlogin, this.onExitLogined, this);
        wechat.eventManager.on(componentEvent.approveJob, this.onApproveJob, this);
        wechat.eventManager.on(componentEvent.joblist, this.onJoblist, this);
    }
    this.onExitLogined = function (httpContext)
    {
        httpContext.appendRenderText(sysUtil.format(this.messexit, httpContext.session["user"]));
        httpContext.gotoStatus(status.registered);
    }
    this.onLoginedHelp = function (httpContext)
    {
        httpContext.appendRenderText(this.messHelp);
        httpContext.renderMessage();
    }

    this.onJoblist = function (httpContext)
    {
        httpContext.appendRenderText(this.messList);
        httpContext.renderMessage();
    }

    this.onApproveJob = function (httpContext)
    {
        var content = httpContext.userMsg.Content;
        var matched = loginedComponent.regApproval.exec(content);
        var result = matched[1], No = matched[2];
        httpContext.appendRenderText(sysUtil.format(this.messResult, No));
        httpContext.renderMessage();

    }

}

sysUtil.inherits(loginedComponent, wechat.WechatComponent);
wechat.registerComMgr(loginedComponent);




var message = new wechat.WechatMessage();
message.currentStatus = status.logined;
message.event = componentEvent.exitlogin;
message.matchReg = /^exit$/i;
wechat.registerMessage(message);


var message = new wechat.WechatMessage();
message.currentStatus = status.logined;
message.event = componentEvent.logined;
wechat.registerMessage(message);

var message = new wechat.WechatMessage();
message.currentStatus = status.logined;
message.event = componentEvent.joblist;
message.matchReg = loginedComponent.regJobList;

wechat.registerMessage(message);

var message = new wechat.WechatMessage();
message.currentStatus = status.logined;
message.matchReg = loginedComponent.regApproval;
message.event = componentEvent.approveJob;
wechat.registerMessage(message);
