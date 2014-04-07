

var http = require('http');
var httpModule = require('./HttpProcessModule');

http.createServer(function (req, res)
{
    httpModule.processRequest(req, res);

}).listen(80, "");  
console.log('Serverrunning at http://127.0.0.1:80/');  