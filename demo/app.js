const ValleyServer = require('../src/index');

const path = require('path');

const server = new ValleyServer();

server.staticPath(path.join(__dirname, 'static'));

server.use('test', async function(next) {
  this.context.text('hello valley');
  await next();
});

const port = 8080;
server.listen(port).then(res => console.log(`http://localhost:${port}`));
