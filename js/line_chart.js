var LineChart;

LineChart = (function() {
  function LineChart(doomName) {
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

  LineChart.prototype.generate = function(data) {
    this.data = data
    var parseDate = d3.time.format("%Y-%m-%d").parse;

//     data.forEach(function(d) {
//       debugger
//       d.Date = parseDate(d.Date);
//       d.Close = +d.Close
//     })

    this.x.domain([data[0].Date, data[data.length - 1].Date]);
    this.y.domain([0, d3.max(data, function(d) { return d.Close; })]);

    this.path = this.svg.append("path")
                    .datum(data)
                    .attr('class', 'area')
                    .attr("d", this.area)
                    .attr("fill", "#333")
                    .attr("opacity", .8)

    this.path2 = this.svg.append('path')
                    .datum(data)
                    .attr('class', 'areaLine')
                    .attr('d', this.line)
                    .attr("fill", "none")
                    .attr("stroke", "#B4B4B4")

    this.xAxis = d3.svg.axis()
                      .scale(this.x)
                      .ticks(5)
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
        .attr("dy", ".35em")
        .attr("fill", '#646464')
        .text(d3.max(data, function(d) { return d.Close; }))

    this.svg.append("text")
        .attr('class', 'minData')
        .attr("x", this.width-50)
        .attr("y", this.height-10)
        .attr("dy", ".35em")
        .attr("fill", '#646464')
        .text(d3.min(data, function(d) { return d.Close; }))

  }

  LineChart.prototype.update = function(newData) {
    this.data.push(newData);
    this.x.domain([this.data[0].Date, this.data[this.data.length - 1].Date]);
    this.y.domain([0, d3.max(this.data, function(d) { return d.Close; })]);

    this.path2.datum(this.data)
          .attr("d", this.line)
    this.path.attr("d", this.area)

    this.gx.call(this.xAxis)

    $('.maxData').html(null)
    $('.minData').html(null)

    this.svg.append("text")
        .attr('class', 'maxData')
        .attr("x", this.width-50)
        .attr("y", 30)
        .attr("dy", ".35em")
        .attr("fill", '#646464')
        .text(d3.max(this.data, function(d) { return d.Close; }))

    this.svg.append("text")
        .attr('class', 'minData')
        .attr("x", this.width-50)
        .attr("y", this.height-10)
        .attr("dy", ".35em")
        .attr("fill", '#646464')
        .text(d3.min(this.data, function(d) { return d.Close; }))
  }

  return LineChart;
})();
