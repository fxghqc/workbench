var koa = require('koa');
var app = module.exports = koa();
var fs = require('fs');
var path = require('path');
var extname = path.extname;
var serve = require('koa-static');
var router = require('koa-router');

app.use(serve('./html'));
// app.use(serve('./public'));
app.use(router(app));

app.use(function *(){
  this.body = 'Hello World';
});

var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);

/*
app.get('/', function *(next) {
  yield this.render('index', {my: 'data'});
});
*/

io.on('connection', function(socket) {
  console.log('a user connected');
/*
  socket.on('my other event', function (data) {
        console.log(data);
  });
*/
  socket.on('disconnect', function() {
    console.log('user disconnected');
  })
});

/*
Tail = require('tail').Tail;
tail = new Tail('/home/fx/apps/jboss-5.1.0.GA_with_mro/server/baoom/log/server.log');

tail.on("line", function(data) {
  io.emit('logs', {data: data});
  console.log(data);
});

tail.on("error", function(error) {
  console.log("ERROR: ", error);
});
*/

var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function() {
  console.log('Client :: ready');
  conn.exec('tail -f /home/baoom/jboss-5.1.0.GA_with_mro/server/baoom/log/server.log', function(err, stream) {
    if (err) throw err;
    stream.on('close', function(code, signal) {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', function(data) {
      // stdout
      io.emit('logs', {data: '' + data});
    }).stderr.on('data', function(data) {
      // stderr
      console.log(data);
    });
  });
}).connect({
  host: '166.111.80.219',
  port: 22,
  username: 'baoom',
  privateKey: require('fs').readFileSync('/home/fx/.ssh/id_rsa')
});

if (!module.parent) server.listen(3000);
console.log('listening on port 3000');
