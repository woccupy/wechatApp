/*
HttpProcessModule is hooked on the HttpServer.
*/
              
// JScript source code

//region 事件注册分发器
function MessageModule()
{
	
    this.events = {};
    this.on = function (eventName,method,scope)
    {
        if (!this.events[eventName])
        {
            this.events[eventName] = [];
        }
        if (method instanceof Function )
        {
            this.events[eventName].push([method,scope]);
        }
    }
    this.off= function (eventName, method)
    {
    	
        if (!this.events[eventName])
            return;
        for (var i = 0, length = this.events[eventName].length; i < length; i++)
        {
            if (this.events[eventName][i][0] != method)
                continue;
            this.events[eventName][i] = null;
            break;
        }
    }
    this.emit = function (eventName)
    {
        if (!this.events[eventName])
            return;
        for (var i = 0, length = this.events[eventName].length; i < length; i++)
        {
        	
            if (!this.events[eventName][i])
                break;
            var method = this.events[eventName][i][0];
            var scope = this.events[eventName][i][1];

            var args = [];
            for (var i = 1; i < arguments.length; i++)
            {
                args.push(arguments[i]);
            }
            if (method.apply(scope, args) === false)
            {
                return false;
            }
        }
    }
    //endregion
}

exports.getMessageManager=function()
{
	return new MessageModule();
}




