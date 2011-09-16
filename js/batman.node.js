(function() {
  var Batman, querystring, url;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  url = require('url');
  querystring = require('querystring');
  Batman = require('./batman').Batman;
  Batman.Request.prototype.getModule = function(protocol) {
    var requestModule;
    return requestModule = (function() {
      switch (protocol) {
        case 'http:':
        case 'https:':
          return require(protocol.slice(0, -1));
        default:
          throw "Unrecognized request protocol " + protocol;
      }
    })();
  };
  Batman.Request.prototype.send = function(data) {
    var auth, options, path, protocol, request, requestModule, requestURL, _ref;
    requestURL = url.parse(this.get('url', true));
    protocol = requestURL.protocol;
    requestModule = this.getModule(protocol);
    path = requestURL.pathname;
    if (this.get('method') === 'GET') {
      path += querystring.stringify(Batman.mixin({}, requestURL.query, this.get('data')));
    }
    options = {
      path: path,
      method: this.get('method'),
      port: requestURL.port,
      host: requestURL.hostname,
      headers: {}
    };
    auth = this.get('username') ? "" + (this.get('username')) + ":" + (this.get('password')) : requestURL.auth ? requestURL.auth : void 0;
    if (auth) {
      options.headers["Authorization"] = "Basic " + (new Buffer(auth).toString('base64'));
    }
    if ((_ref = options.method) === "PUT" || _ref === "POST") {
      options.headers["Content-type"] = this.get('contentType');
    }
    request = requestModule.request(options, __bind(function(response) {
      data = [];
      response.on('data', function(d) {
        return data.push(d);
      });
      return response.on('end', __bind(function() {
        var status;
        data = data.join();
        this.set('response', data);
        status = this.set('status', response.statusCode);
        if ((status >= 200 && status < 300) || status === 304) {
          return this.success(data);
        } else {
          return this.error(data);
        }
      }, this));
    }, this));
    auth = this.get('username') ? "" + (this.get('username')) + ":" + (this.get('password')) : requestURL.auth ? requestURL.auth : void 0;
    if (auth) {
      request.setHeader("Authorization", new Buffer(auth).toString('base64'));
    }
    if (this.get('method' === 'POST')) {
      request.write(JSON.stringify(this.get('data')));
    }
    request.end();
    request.on('error', function(e) {
      this.set('response', error);
      return this.error(error);
    });
    return request;
  };
  exports.Batman = Batman;
}).call(this);
