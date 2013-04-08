(function () {

	var Graph = function (data, opts) {
		this.settings = $.extend({
			margin: { top: 20, right: 20, bottom: 30, left: 100 },
			width: 890,
			height: 450,
			xLabel: 'Time',
			yLabel: '',
			id: '#graph' + Math.floor(Math.random() * 1000)
		}, opts);

		this.draw(data);
	};

	//Data from graphite is something like [ [<datum>, <time>] ]
	Graph.prototype.draw = function (data) {
		if (!data || !data.length) return;
		var margin = this.settings.margin,
		    width = this.settings.width,
		    height = this.settings.height;

		var x = this.x = d3.time.scale()
			.domain(d3.extent(data, function (d) { return d[1]; }))
			.range([0, width]);

		var y = this.y = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d[0]; }))
			.range([height, 0]);

		var xAxis = this.xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = this.yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		this.area = d3.svg.area()
			.x(function (d) { return x(d[1]); })
			.y0(height)
			.y1(function (d) { return y(d[0]); })

		this.svg = d3.select(this.settings.id).append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  this.svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
	    .append('text')
	    	.style("text-anchor", "start")
	    	.text(this.settings.xLabel);

	  this.svg.append('path')
	  	.datum(data)
	  	.attr('class', 'area')
	  	.attr('d', this.area);

	  this.svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(this.settings.yLabel);
	};

	Graph.prototype.redraw = function (data) {
		if (!this.svg) return this.draw(data);
		this.x
			.domain(d3.extent(data, function (d) { return d[1]; }))
			.range([0, this.settings.width]);

		this.y
			.domain(d3.extent(data, function(d) { return d[0]; }))
			.range([this.settings.height, 0]);

		var graph = d3.select(this.settings.id).transition();

		graph.select('.area').attr('d', this.area(data));
		graph.select('.x.axis').duration(750).call(this.xAxis);
		graph.select('.y.axis').duration(750).call(this.yAxis);
	};

	this.Graph = Graph;

})();