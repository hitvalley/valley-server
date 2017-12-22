# valley-server

code: https://github.com/hitvalley/server-module

> server with valley-module: https://github.com/hitvalley/valley-module

## 引入 valley-server

```
npm i --save valley-server
```

## 代码

```
// 创建 app.js
const ValleyServer = require('valley-server');

const server = new ValleyServer();
server.use('test', async function(next){
  this.context.test('hello valley');
  await next();
});

server.listen({
  port: 3000
}).listen(res => console.log('http://localhost:3000'));
```

## 运行

```
node app.js
```
