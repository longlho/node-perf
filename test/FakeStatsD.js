(function () {
	var EventEmitter = require('events').EventEmitter
		, util = require('util');
	var FakeStatsD = function () {
		EventEmitter.call(this);
		var self = this;
		var echo = function () {
			var args = Array.prototype.slice.call(arguments);
			self.emit('stat', args);
		};

		this.timing = this.gauge = this.increment = this.decrement = echo;
		this.socket = { on: function () {} };
	};

	util.inherits(FakeStatsD, EventEmitter);

	module.exports = FakeStatsD;
})();