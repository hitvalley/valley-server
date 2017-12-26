const ValleyModule = require('valley-module');
const http = require('http');
const https = require('https');
const fs = require('fs');

class ValleyServer extends ValleyModule {
  prepare() {
    this.use('prepare', async next => {
      this.context.text = async (text, headers) => {
        let res = this.context.res;
        Object.keys(headers || {}).forEach(key => {
          res.setHeader(key, headers[key]);
        });
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
}

module.exports = ValleyServer;
