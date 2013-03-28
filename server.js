(function () {

	var Performance = require('./index')
		, connect = require('connect');

	var perf = new Performance({
		interval: 1000,
		statsd: {
			host: 'ec2-54-224-116-156.compute-1.amazonaws.com',
			port: 8125,
			prefix: 'nperf.'
		}
	});
	perf.on('error', function (err) {
		console.log(err);
	});
	var app = connect()
		.use(perf.getMiddleware())
		.use(function (req, res) {
			setTimeout(function () {
				res.end(JSON.stringify({ time: new Date() }));	
			}, Math.random() * 100);
		})
		.listen(3000);

})();
