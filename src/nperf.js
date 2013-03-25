(function () {

  var events = require('events')
    , os = require('os')
    , _ = require('underscore')._;

  var Performance = function (opts) {
    events.EventEmitter.call(this);
    var self = this;
    // Configuration, logistic stuff
    this.settings = {
      interval: 1000 * 60 // 1 min
      statsd: {
        host: 'localhost',
        port: 8125,
        prefix: 'nperf'
      }
    };

    // Handle configuration changes
    this.on('changed:configuration', function (settings) {
      clearInterval(self._timer);
      self._timer = setInterval(self.run, self.settings.interval);
    });

    this._timer = setInterval(this.run.bind(this), this.settings.interval);
    this._metrics = new StatsD(this.settings.statsd.host, this.settings.statsd.port, this.settings.statsd.prefix);
    this._metrics.socket.on('error', this.emit.bind(this, 'error');
      
    process.on('uncaughtException', this.emit.bind(this, 'error'));
  };

  util.inherits(Performance, events.EventEmitter);

  Performance.prototype.configure = function (opts) {
    this.settings = _.extend(this.settings, opts);
    this.emit('changed:configuration', this.settings);
  };

  Performance.prototype.run = function () {
    this._metrics.gauge('process.uptime', process.uptime());
    this._metrics.gauge('process.heapUsed', process.memoryUsage().heapUsed);
  };

  // Returns a Connect middleware
  Performance.prototype.getMiddleware = function (req, res, next) {
    var start = process.hrtime()
      , self = this;
    this._metrics.increment('requests');
    this._metrics.increment('requests.current');
    res.on('header', function () {
      self._metrics.decrement('requests.current');
      self._metrics.timing('responseTime', process.hrtime(start)[0]);
    });
    return next();
  };


  module.exports = Performance;
})();