const ValleyServer = require('../src/index');

const path = require('path');

const server = new ValleyServer();

server.use('time', async function(next){
  console.time('server-time');
  await next();
  console.timeEnd('server-time');
});

server.staticPath(path.join(__dirname, 'static'));
server.staticPath(path.join(__dirname, 'static/img'), /\.svg$/);

server.use('default', async function(next) {
  this.context.text('hello valley');
  await next();
});

const port = 8080;
server.listen(port).then(res => console.log(`http://localhost:${port}`));
