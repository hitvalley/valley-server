const ValleyModule = require('valley-module');
const ValleyRouter = require('valley-router');
const pathToRegexp = require('path-to-regexp');

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

class ValleyServer extends ValleyModule {
  constructor(input) {
    super(input);
    this.staticList = [];
  }
  prepare() {
    this.use('prepare', async next => {
      this.context.text = async (text, headers) => {
        let res = this.context.res;
        Object.keys(headers || {}).forEach(key => {
          res.setHeader(key, headers[key]);
        });
        console.log(text)
        res.end(`${text}\n`);
      };
      this.context.json = async (data, headers) => {
        let res = this.context.res;
        Object.keys(headers || {}).forEach(key => {
          res.setHeader(key, headers[key]);
        });
        let text = JSON.stringify(data);
        res.end(`${text}\n`);
      };
      await next();
    });
  }
  listen(input) {
    let options;
    let server;
    if (typeof input === 'string' || typeof input === 'number') {
      options = {
        port: input
      };
    } else {
      options = input || {};
    }
    let type = options.type || 'http';
    let host = options.host || '0.0.0.0';
    let port = options.port || 8080;
    return new Promise((resolve, reject) => {
      switch(type) {
      case 'https':
        server = https.createServer({
          key: fs.readFileSync(options.key),
          cert: fs.readFileSync(options.cert),
        }, (req, res) => {
          this.run({
            req,
            res
          });
        });
        break;
      case 'http':
      default:
        server = http.createServer((req, res) => {
          this.run({
            req,
            res
          });
        });
      }
      server.listen({
        port,
        host
      }, function() {
        resolve(arguments);
      });
    });
  }
  staticPath(pathname, rule) {
    rule = rule || '/';
    // let pathRule = pathToRegexp(rule + '(.*\.(css|js|html|svg)$)')
    let pathRule = new RegExp(rule + '(.*\\.(?:css|js|html|svg))$')
    this.use(`static-${rule}`, async function(next) {
      let reqPath = this.context.req.url;
      // let res = pathRule.match(path);
      let res = reqPath.match(pathRule);
      // console.log(res, reqPath, pathRule);
      if (res && res[1]) {
        console.log(path.join(pathname, res[1]))
        let content = fs.readFileSync(path.join(pathname, res[1]));
        this.context.text(content.toString());
      } else {
        await next();
      }
    });
  }
}

module.exports = ValleyServer;
