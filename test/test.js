var http = require('http')
	, _ = require('underscore')._
	, assert = require('assert')
	, connect = require('connect')
	, NP = require('../index')
	, FakeStatsD = require('./FakeStatsD');


describe('Node-Performance', function () {
	describe('#intialize', function () {
		it('should initialize everything correctly', function () {
			var np = new NP();
			assert(np);
			assert(np._timer);
			assert(np._metrics);
			assert.deepEqual(np.settings, {
	      interval: 1000 * 60, // 1 min
	      statsd: {
	        host: 'localhost',
	        port: 8125,
	        prefix: 'nperf'
	      }
	    }, 'Should have default settings')
		});
	});

	describe('#configure', function () {
		var np = new NP();
		it('should extend settings and restart stuff correctly', function (done) {
			var oldTimer = np._timer
				, oldSettings = _.clone(np.settings);
			np.once('changed:configuration', function (settings) {
				assert.notDeepEqual(oldSettings, settings, 'Settings should not be the same');
				assert.deepEqual(settings, {
		      interval: 2000 * 60, // 2 min
		      statsd: {
		        host: 'localhost',
		        port: 8125,
		        prefix: 'nperf'
		      }
		    }, 'Should have new settings');
		    assert.notStrictEqual(np._timer, oldTimer, 'Timer should also be changed');
		    done();
			});
			np.configure({
				interval: 2000 * 60
			});
		});
	});

	describe('#collect', function () {
		this.timeout(3000);
		var np = new NP({ interval: 1000 })
			, stats = [];
		np._metrics = new FakeStatsD();
		np._metrics.on('stat', function (s) {
			stats.push(s);
		});
		np.run();
		it('should collect stats every sec by default', function (done) {
			setTimeout(function () {
				assert.strictEqual(stats.length, 4, 'should collect 4 process stats');
				done();
			}, 2200);
		});
	});

	describe('#getMiddleware', function () {
		var np = new NP()
			, stats = [];
		np._metrics = new FakeStatsD();
		np._metrics.on('stat', function (s) {
			stats.push(s);
		});
		np.stop();
		var app = connect()
		  .use(np.getMiddleware())
		  .use(connect.static('public'))
		  .use(function(req, res) {
		  	setTimeout(function () {
		  		res.end('hello world\n');
		  	}, 1000);
		  })
		 .listen(3000);

		it('should collect stats every sec by default', function (done) {
			http.get('http://localhost:3000/', function (res) {
				assert.strictEqual(stats.length, 4, 'should collect 4 request stats');
				assert.deepEqual(stats[0], ['requests'], '1st is request count');
				assert.deepEqual(stats[1], ['requests.current'], '2nd is current request count');
				assert.deepEqual(stats[2], ['requests.current'], '3rd is current request count');
				assert.strictEqual(stats[3][0], 'responseTime', '4th is responseTime');
				assert(stats[3][1]);
				done();
			});
		});
	});
});

