const ValleyModule = require('valley-module');
const debug = require('debug')('valley-server');

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ContentTypeConfig = {
  'html': 'text/html',
  'json': 'application/json',
  'js': 'application/javascript',
  'css': 'text/css',
  'svg': 'image/svg+xml',
  'png': 'image/png',
  'gif': 'image/gif',
  'jpg': 'image/jpg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'mp3': 'audio/mp3',
  'mp4': 'audio/mp4',
  'woff': 'application/font-woff',
  'woff2': 'application/font-woff2',
  'eot': 'application/octet-stream',
  'emz': 'application/octet-stream',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',
};

const DefaultOptions = {
  encoding: 'utf-8'
};

let send = (res, data, headers) => {
  res.setHeader('Content-Encoding', 'identity');
  Object.keys(headers || {}).forEach(key => {
    res.setHeader(key, headers[key]);
  });
  res.end(`${data}\n`);
};

class ValleyServer extends ValleyModule {
  constructor(input) {
    super(input);
    this.staticList = [];
  }
  prepare() {
    this.use('prepare', async next => {
      this.text = this.context.text = async (text, headers) => {
        let res = this.context.res;
        send(res, text, Object.assign({
          'Content-Type': ContentTypeConfig.html
        }, headers || {}));
      };
      this.json = this.context.json = async (data, headers) => {
        let res = this.context.res;
        data = typeof data === 'string' ? JSON.stringify(data) : data;
        send(res, data, Object.assign({
          'Content-Type': ContentTypeConfig.json
        }, headers || {}));
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
  staticPath(pathname, options) {
    // rule = rule || '/';
    // let pathRule = pathToRegexp(rule + '(.*\.(css|js|html|svg)$)')
    // let pathRule = new RegExp(rule + '(.*\\.(?:css|js|html|svg))$')
    let otype = typeof options
    if (otype === 'string' || otype === 'object') {
      if (otype === 'string') {
        options = {
          rule: options
        }
      }
      options = Object.assign(DefaultOptions, options)
    } else {
      options = DefaultOptions;
    }
    let rule = options.rule || '';
    let encoding = options.encoding;
    debug('static path options: ', JSON.stringify(options));
    this.use(`static-${rule}`, async function(next) {
      let reqPath = this.context.req.url;
      if (rule && !rule.test(reqPath)) {
        debug(`${reqPath} not match the rule [${rule}]`);
        return await next();
      }
      let filename = path.join(pathname, reqPath);
      let hasFile = false;
      if (fs.existsSync(filename)) {
        let fsStat = fs.statSync(filename);
        if (fsStat.isFile()) {
          hasFile = true;
        }
      }
      if (hasFile) {
        let res = filename.match(/\.([^.]+)$/);
        let contentType = ContentTypeConfig[res && res[1]] || 'text/html';
        let content = fs.readFileSync(filename, {
          encoding,
          flag: 'r'
        });
        this.context.text(content.toString(), {
          'Content-Type': `${contentType};charset=${encoding}`,
        });
      } else {
        this.context.res.state = 404;
        await next();
      }
    });
  }
}

module.exports = ValleyServer;
