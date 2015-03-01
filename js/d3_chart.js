var D3Chart;

D3Chart = (function() {
  function D3Chart(doomName) {
    this.doomName = doomName

    this.width = $(this.doomName).width()
    this.height = $(this.doomName).height()
    this.marginTop = 20
    this.marginBottom = 20

    this.x = d3.time.scale().range([0, this.width])
    this.y = d3.scale.linear().range([this.height, this.marginTop + this.marginBottom])

    this.area = d3.svg.area()
                  .x((function(_this) {return function(d) { return _this.x(d.Date); }})(this))
                  .y0(this.height)
                  .y1((function(_this) {return function(d) { return _this.y(d.Close); }})(this))

    this.line = d3.svg.line()
                    .interpolate( 'linear' )
                    .x((function(_this) {return function(d) { return _this.x(d.Date); }})(this))
                    .y((function(_this) {return function(d) { return _this.y(d.Close); }})(this))

    this.svg = d3.select(this.doomName).append("svg")
                  .attr("width", this.width)
                  .attr("height", this.height)
                  .append("g")
                  .attr("transform", "translate(5, -20)")
  }

  D3Chart.prototype.generateLineChart = function(collection, className, showLabels) {
    data = $.extend(true, [], collection);
    var parseDate = d3.time.format("%Y-%m-%d").parse;

    data.forEach(function(d) {
      d.Date = parseDate(d.Date);
      d.Close = +d.Close
    })

    var maxData = d3.max(data, function(d) { return d.Close; }),
        minData = d3.min(data, function(d) { return d.Close; })

    var startPoint = (maxData - (maxData - minData) / 0.9)

    this.x.domain([data[0].Date, data[data.length - 1].Date]);
    this.y.domain([startPoint, maxData]);


    var tooltip = d3.select("body").append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0)

    this.path2 = this.svg.append('path')
                    .datum(data)
                    .attr('class', className)
                    .attr('d', this.line)

    this.xAxis = d3.svg.axis()
                      .scale(this.x)
                      .ticks(3)
                      .tickSize(-this.height)
                      .orient("bottom");

    this.gx = this.svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + this.height + ")")
                  .call(this.xAxis);

    this.svg.append("text")
        .attr('class', 'maxData')
        .attr("x", this.width-50)
        .attr("y", 30)
        .text(maxData)

    this.svg.append("text")
        .attr('class', 'minData')
        .attr("x", this.width-50)
        .attr("y", this.height-10)
        .text(minData)

    this.svg.selectAll("path")
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr("r", 2)
                    .attr("cx", (function(_this) {return function(d) { return _this.x(d.Date); }})(this))
                    .attr("cy", (function(_this) {return function(d) { return _this.y(d.Close); }})(this))
                    .style("fill", "blue")
                    .style("stroke", "none")
                    .style("pointer-events", "all")
                    .on("mouseover", function(d) {
                      tooltip.transition()
                              .duration(200)
                              .style("opacity", .85)
                              .style("background", "#6C6C6C")
                              .style("color", "#fff")
                      tip = moment(d.Date).format("YYYY-MM-DD") + "<br/>"
                      tip += "Close Price: $" + d.Close + "<br/>"
                      tooltip.html(tip)
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY - 30) + "px");
                    })
                    .on("mouseout", function(d) {
                      tooltip.transition()
                        .duration(500)
                        .style("opacity", 0)
                    })

  }

  D3Chart.prototype.generateLineArea = function(collection, className) {
    data = $.extend(true, [], collection);
    var parseDate = d3.time.format("%Y-%m-%d").parse;

    data.forEach(function(d) {
      d.Date = parseDate(d.Date);
      d.Close = +d.Close
    })

    this.svg.append("path")
              .datum(data)
              .attr('class', className)
              .attr("d", this.area)
  }

  D3Chart.prototype.generateBarChart = function(collection, className) {
    data = $.extend(true, [], collection);
    var parseDate = d3.time.format("%Y-%m-%d").parse;

    data.forEach(function(d) {
      d.Date = parseDate(d.Date);
      d.Close = +d.Close
    })

    var maxData = d3.max(data, function(d) { return d.Close; }),
        minData = d3.min(data, function(d) { return d.Close; })

    var startPoint = (maxData - (maxData - minData) / 0.9)

    this.x.domain([data[0].Date, data[data.length - 1].Date]);
    this.y.domain([startPoint, maxData]);

    this.svg.selectAll("rect")
              .data(data)
              .enter()
              .append("rect")
              .attr('class', className)
              .attr("x", (function(_this) { return function(d) {return _this.x(d.Date);} }(this)))
              .attr("y", (function(_this) { return function(d) {return _this.y(d.Close);} }(this)))
              .attr("width", this.width / data.length - 1)
              .attr("height", (function(_this) { return function(d) {return _this.height - _this.y(d.Close);} }(this)))
  }

  return D3Chart;
})();
