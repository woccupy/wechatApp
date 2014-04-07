
var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'wangl',
    password: '123456',
    database: 'wechat',
    port: 3306
});
conn.connect();
conn.query('SELECT * from wechatuser', function (err, rows, fields)
{
    if (err) throw err;
    console.log('The solution is: ', rows[0].solution);
});

conn.query('insert into wechatuser(id,content) values("test1","this is the first example of inserting a row into a mysql server.")', function (err, rows, fields)
{
    if (err) throw err;
    console.log('The solution is: ', rows[0].solution);
});



conn.end();