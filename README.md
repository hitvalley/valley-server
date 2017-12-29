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

const ValleyServer = require('../src/index');

const path = require('path');

const server = new ValleyServer();

// 设置服务器时间
server.use('time', async function(next){
  console.time('start');
  await next();
  console.timeEnd('start');
});

// 静态文件服务设置
server.staticPath(path.join(__dirname, 'static'));
server.staticPath(path.join(__dirname, 'static/img'), /\.svg$/);

// 动态文件服务设置
server.use('default', async function(next) {
  this.context.text('hello valley');
  await next();
});

const port = 8080;
server.listen(port).then(res => console.log(`http://localhost:${port}`));
```

## 运行

```
node app.js
```
