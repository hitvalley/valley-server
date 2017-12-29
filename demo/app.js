const ValleyServer = require('../src/index');

const path = require('path');

const server = new ValleyServer();

server.use('time', async function(next){
  console.time('start');
  await next();
  console.timeEnd('start');
});

server.staticPath(path.join(__dirname, 'static'));
server.staticPath(path.join(__dirname, 'static/img'), /\.svg$/);

server.use('default', async function(next) {
  this.context.text('hello valley');
  await next();
});

const port = 8080;
server.listen(port).then(res => console.log(`http://localhost:${port}`));
