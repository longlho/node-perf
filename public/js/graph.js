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

	Graph.prototype.draw = function (data) {
		if (!data || !data.length) return;
		var margin = this.settings.margin,
		    width = this.settings.width,
		    height = this.settings.height;

		var x = d3.time.scale().range([0, width]);

		var y = d3.scale.linear().range([height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		this.line = d3.svg.line()
		    .x(function(d) { return x(d[1]); })
		    .y(function(d) { return y(d[0]); });

		this.svg = d3.select(this.settings.id).append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  x.domain(d3.extent(data, function(d) { return d[1]; }));
	  y.domain(d3.extent(data, function(d) { return d[0]; }));

	  this.svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis)
	    .append('text')
	    	.style("text-anchor", "start")
	    	.text(this.settings.xLabel);

	  this.svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(this.settings.yLabel);

	  this.svg.append("path")
	      .data([data])
	      .attr("class", "line")
	      .attr("d", this.line);
	};

	Graph.prototype.redraw = function (data) {
		if (!this.svg) return this.draw(data);

		this.svg.selectAll('path').data([data]).attr('d', this.line);
	};

	this.Graph = Graph;

})();