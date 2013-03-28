(function () {

  var events = require('events')
    , util = require('util')
    , StatsD = require('node-statsd').StatsD
    , os = require('os');

  var _extend = function (def, opts) {
    if (!opts) return def;
    var res = {};
    for (var k in def) {
      res[k] = opts[k] || def[k];
    }
    return res;
  };

  var Performance = function (opts) {
    events.EventEmitter.call(this);
    var self = this;
    // Configuration, logistic stuff
    this.settings = _extend({
      interval: 1000 * 60, // 1 min
      statsd: {
        host: 'localhost',
        port: 8125,
        prefix: 'nperf'
      }
    }, opts);

    // Handle configuration changes
    this.on('changed:configuration', this.run.bind(this));

    this._metrics = new StatsD(this.settings.statsd.host, this.settings.statsd.port, this.settings.statsd.prefix);
    
    this.emitErrors = this.emit.bind(this, 'error');
    this._metrics.socket.on('error', this.emitErrors);
      
    this.run();
  };

  util.inherits(Performance, events.EventEmitter);

  Performance.prototype.configure = function (opts) {
    this.settings = _extend(this.settings, opts);
    this.emit('changed:configuration', this.settings);
  };

  Performance.prototype.collect = function () {
    this._metrics.gauge('process.uptime', process.uptime());
    this._metrics.gauge('process.heapUsed', process.memoryUsage().heapUsed);
  };

  // Returns a Connect middleware
  Performance.prototype.getMiddleware = function () {
    var self = this;
    return function (req, res, next) {
      var start = Date.now();
      self._metrics.increment('requests.total');
      self._metrics.increment('requests.current');

      //Avoid rebinding on response object reuse
      if (res._timings) return next();
      res._timings = true;
      
      res.on('header', function () {
        self._metrics.decrement('requests.current');
        self._metrics.timing('responses.time', Date.now() - start);
      });
      return next();
    };
  };

  Performance.prototype.run = function () {
    this.stop();
    this._timer = setInterval(this.collect.bind(this), this.settings.interval);
    process.on('uncaughtException', this.emitErrors);
  };

  Performance.prototype.stop = function () {
    this._timer && clearInterval(this._timer);
    process.removeListener('uncaughtException', this.emitErrors);
  };

  module.exports = Performance;
})();