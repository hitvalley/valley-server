const ValleyServer = require('../src/index');

const server = new ValleyServer();

server.use('test', async function(next) {
  this.context.text('hello valley');
  await next();
});

const port = 8080;
server.listen(port).then(res => console.log(`http://localhost:${port}`));
