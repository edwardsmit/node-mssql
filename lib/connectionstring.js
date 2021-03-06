// Generated by CoffeeScript 1.12.3
(function() {
  var IGNORE_KEYS, parseConnectionString, parseConnectionURI, qs, resolveConnectionString, url,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  url = require('url');

  qs = require('querystring');

  IGNORE_KEYS = ['stream'];

  parseConnectionURI = function(uri) {
    var instance, key, object, parsed, password, path, ref, user, value;
    parsed = url.parse(uri);
    path = parsed.pathname.substr(1).split('/');
    if (path.length > 1) {
      instance = path.shift();
    }
    if (parsed.auth) {
      parsed.auth = parsed.auth.split(':');
      user = parsed.auth.shift();
      password = parsed.auth.join(':');
    }
    object = {
      server: "" + parsed.hostname + (parsed.port ? "," + parsed.port : instance ? "\\" + instance : ""),
      uid: user || '',
      pwd: password || '',
      database: path[0]
    };
    if (parsed.query) {
      ref = qs.parse(parsed.query);
      for (key in ref) {
        value = ref[key];
        if (key === 'domain') {
          object.uid = value + "\\" + object.uid;
        } else {
          object[key] = value;
        }
      }
    }
    Object.defineProperty(object, 'toString', {
      value: function() {
        return ((function() {
          var ref1, results;
          ref1 = this;
          results = [];
          for (key in ref1) {
            value = ref1[key];
            if (indexOf.call(IGNORE_KEYS, key) < 0) {
              results.push(key + "={" + value + "}");
            }
          }
          return results;
        }).call(this)).join(';');
      }
    });
    return object;
  };

  parseConnectionString = function(string) {
    var buffer, char, cursor, original, param, parsed, parsing, quotes;
    cursor = 0;
    parsing = 'name';
    param = null;
    buffer = '';
    quotes = null;
    parsed = {};
    original = {};
    Object.defineProperty(parsed, '__original__', {
      value: original
    });
    Object.defineProperty(parsed, 'toString', {
      value: function() {
        var key, value;
        return ((function() {
          var ref, ref1, ref2, ref3, ref4, results;
          ref = this;
          results = [];
          for (key in ref) {
            value = ref[key];
            if (indexOf.call(IGNORE_KEYS, key) < 0) {
              results.push(original[key].name + "=" + ((ref1 = (ref2 = original[key].escape) != null ? ref2[0] : void 0) != null ? ref1 : '') + value + ((ref3 = (ref4 = original[key].escape) != null ? ref4[1] : void 0) != null ? ref3 : ''));
            }
          }
          return results;
        }).call(this)).join(';');
      }
    });
    while (cursor < string.length) {
      char = string.charAt(cursor);
      switch (char) {
        case '=':
          if (parsing === 'name') {
            buffer = buffer.trim();
            param = buffer.toLowerCase();
            original[param] = {
              name: buffer
            };
            parsing = 'value';
            buffer = '';
          } else {
            buffer += char;
          }
          break;
        case '\'':
        case '"':
          if (parsing === 'value') {
            if (!buffer.trim().length) {
              original[param].escape = [char, char];
              quotes = char;
              buffer = '';
            } else {
              if (quotes) {
                if (char === quotes) {
                  if (char === string.charAt(cursor + 1)) {
                    buffer += char;
                    cursor++;
                  } else {
                    parsed[param] = buffer;
                    param = null;
                    parsing = null;
                    buffer = '';
                    quotes = null;
                  }
                } else {
                  buffer += char;
                }
              } else {
                buffer += char;
              }
            }
          } else {
            throw new Error("Invalid connection string.");
          }
          break;
        case '{':
          if (parsing === 'value') {
            if (!buffer.trim().length) {
              original[param].escape = ['{', '}'];
              quotes = '{}';
              buffer = '';
            } else {
              buffer += char;
            }
          } else {
            throw new Error("Invalid connection string.");
          }
          break;
        case '}':
          if (parsing === 'value') {
            if (quotes === '{}') {
              parsed[param] = buffer;
              param = null;
              parsing = null;
              buffer = '';
              quotes = null;
            } else {
              buffer += char;
            }
          } else {
            throw new Error("Invalid connection string.");
          }
          break;
        case ';':
          if (parsing === 'value') {
            if (quotes) {
              buffer += char;
            } else {
              parsed[param] = buffer;
              param = null;
              parsing = 'name';
              buffer = '';
            }
          } else {
            buffer = '';
            parsing = 'name';
          }
          break;
        default:
          buffer += char;
      }
      cursor++;
    }
    if (parsing === 'value') {
      parsed[param] = buffer;
    }
    return parsed;
  };

  resolveConnectionString = function(string) {
    var config, parsed, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, server, user;
    if (/^(mssql|tedious|msnodesql|tds)\:\/\//i.test(string)) {
      parsed = parseConnectionURI(string);
    } else {
      parsed = parseConnectionString(string);
    }
    if (parsed.driver === 'msnodesql') {
      parsed.driver = 'SQL Server Native Client 11.0';
      if ((ref = parsed.__original__) != null) {
        ref.driver = {
          name: 'Driver',
          escape: ['{', '}']
        };
      }
      return {
        driver: 'msnodesql',
        connectionString: parsed.toString()
      };
    }
    user = (ref1 = parsed.uid) != null ? ref1 : parsed['user id'];
    server = (ref2 = (ref3 = (ref4 = (ref5 = parsed.server) != null ? ref5 : parsed.address) != null ? ref4 : parsed.addr) != null ? ref3 : parsed['data source']) != null ? ref2 : parsed['network address'];
    config = {
      driver: parsed.driver,
      password: (ref6 = parsed.pwd) != null ? ref6 : parsed.password,
      database: (ref7 = parsed.database) != null ? ref7 : parsed['initial catalog'],
      connectionTimeout: (ref8 = (ref9 = (ref10 = parsed.connectionTimeout) != null ? ref10 : parsed.timeout) != null ? ref9 : parsed['connect timeout']) != null ? ref8 : parsed['connection timeout'],
      requestTimeout: (ref11 = parsed.requestTimeout) != null ? ref11 : parsed['request timeout'],
      stream: (ref12 = (ref13 = parsed.stream) != null ? ref13.toLowerCase() : void 0) === 'true' || ref12 === 'yes' || ref12 === '1',
      options: {
        encrypt: (ref14 = (ref15 = parsed.encrypt) != null ? ref15.toLowerCase() : void 0) === 'true' || ref14 === 'yes' || ref14 === '1'
      }
    };
    if (parsed.useUTC != null) {
      config.options.useUTC = (ref16 = parsed.useUTC.toLowerCase()) === 'true' || ref16 === 'yes' || ref16 === '1';
    }
    if (config.connectionTimeout != null) {
      config.connectionTimeout = parseInt(config.connectionTimeout);
    }
    if (config.requestTimeout != null) {
      config.requestTimeout = parseInt(config.requestTimeout);
    }
    if (/^(.*)\\(.*)$/.exec(user)) {
      config.domain = RegExp.$1;
      user = RegExp.$2;
    }
    if (server) {
      server = server.trim();
      if (/^np\:/i.test(server)) {
        throw new Error("Connection via Named Pipes is not supported.");
      }
      if (/^tcp\:/i.test(server)) {
        server = server.substr(4);
      }
      if (/^(.*)\\(.*)$/.exec(server)) {
        server = RegExp.$1;
        config.options.instanceName = RegExp.$2;
      }
      if (/^(.*),(.*)$/.exec(server)) {
        server = RegExp.$1.trim();
        config.port = parseInt(RegExp.$2.trim());
      }
      if ((ref17 = server.toLowerCase()) === '.' || ref17 === '(.)' || ref17 === '(localdb)' || ref17 === '(local)') {
        server = 'localhost';
      }
    }
    config.user = user;
    config.server = server;
    return config;
  };

  module.exports = {
    parse: parseConnectionString,
    resolve: resolveConnectionString
  };

}).call(this);
