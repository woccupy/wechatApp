
exports.template = function (tpl, data)
{
    var str = tpl;
    if (data && data.sort)
    {
        for (var i = 0; i < data.length; i++)
        {
            str = str.replace(new RegExp("{\\{" + i + "}}", "gm"), data[i]);
        }
        return str;
    }
    var placeholder = str.match(new RegExp("{{.+?}}", 'ig'));
    if (data && placeholder)
    {
        for (var i = 0; i < placeholder.length; i++)
        {
            var key = placeholder[i];
            var value = proxy.call(data, key.replace(new RegExp("[{,}]", "gm"), ""));
            key = key.replace(new RegExp("\\\.", "gm"), "\\.").replace("{{", "{\\{");
            if (value == null)
                value = "&nbsp;";
            str = str.replace(new RegExp(key, "gm"), value);
        }
    }
    return str;
    function proxy(key)
    {
        try
        {
            return eval('this.' + key);
        } catch (e)
        {
            return "";
        }
    }
};

var textMsg = '<xml> <ToUserName><![CDATA[{{ToUserName}}]]></ToUserName> <FromUserName><![CDATA[{{FromUserName}}]]></FromUserName> <CreateTime>{{CreateTime}}</CreateTime> <MsgType><![CDATA[text]]></MsgType> <Content><![CDATA[{{Content}}]]></Content> </xml>';
var musicMsg = '<xml> <ToUserName><![CDATA[{{ToUserName}}]]></ToUserName> <FromUserName><![CDATA[{{FromUserName}}]]></FromUserName> <CreateTime>{{CreateTime}}</CreateTime> <MsgType><![CDATA[music]]></MsgType> <Music> <Title><![CDATA[{{Title}}]]></Title> <Description><![CDATA[{{Description}}]]></Description> <MusicUrl><![CDATA[{{MusicUrl}}]]></MusicUrl> <HQMusicUrl><![CDATA[{{HQMusicUrl}}]]></HQMusicUrl> </Music> </xml>';
exports.Output = function (msg)
{
    this.msg = msg;

    // text.
    this.text = function (text)
    {
        var data = {};
        data["Content"] = text;
        data["CreateTime"] = new Date().getTime();
        data["ToUserName"] = this.msg.FromUserName;
        data["FromUserName"] = this.msg.ToUserName;
        return exports.template(textMsg, data);
    }
}