var Chart;

Chart = (function() {
  function Chart() {
    this.barChartDoom = "#bar-chart"
    this.lineChartDoom = "#line-chart"
  }

  Chart.prototype.drawBarChart = function(data) {

    var parseDate = d3.time.format("%Y-%m-%d").parse;

    data.forEach(function(d) {
      d.Date = parseDate(d.Date);
      d.Close = +d.Close
    })

    var width = $(this.barChartDoom).width(),
        height = $(this.barChartDoom).height(),
        y = d3.scale.linear().domain([0, d3.max(data, function( d ) { return d.Volume; })]).range([0, height]),
        x = d3.time.scale().domain([data[0].Date, data[data.length - 1].Date]).range([0, width])

    var svg = d3.select(this.barChartDoom)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) {
          return x(d.Date);
        })
        .attr("y", function(d) {
          return height - y(d.Volume);
        })
        .attr("width", width / data.length - 1)
        .attr("height", function(d) {
          return y(d.Volume);
        })
        .attr("fill", "#6C6C6C")
  };

  Chart.prototype.drawLineChart = function(data) {
    var parseDate = d3.time.format("%Y-%m-%d").parse;

//     data.forEach(function(d) {
//       d.Date = parseDate(d.Date);
//       d.Close = +d.Close
//     })

    var width = $(this.lineChartDoom).width(),
        height = $(this.lineChartDoom).height(),
        marginTop = 20;
        marginBottom = 20;

    var x = d3.time.scale().domain([data[0].Date, data[data.length - 1].Date]).range([0, width]),
        y = d3.scale.linear().range([height, marginTop + marginBottom]);

    var area = d3.svg.area()
                  .x(function(d) { return x(d.Date); })
                  .y0(height)
                  .y1(function(d) { return y(d.Close); });

    var line = d3.svg.line()
                    .interpolate( 'linear' )
                    .x( function(d) { return x(d.Date); } )
                    .y( function(d) { return y(d.Close); } )

    var svg = d3.select(this.lineChartDoom).append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", "translate(5, -20)")

    x.domain([data[0].Date, data[data.length - 1].Date]);
    y.domain([0, d3.max(data, function(d) { return d.Close; })]);

    svg.append("path")
        .datum(data)
        .attr('class', 'area')
        .attr("d", area)
        .attr("fill", "#333")
        .attr("opacity", .8)

    svg.append('path')
        .datum(data)
        .attr('class', 'areaLine')
        .attr('d', line)
        .attr("fill", "none")
        .attr("stroke", "#B4B4B4")

    var xAxis = d3.svg.axis()
                      .scale(x)
                      .ticks(5)
                      .tickSize(-height)
                      .orient("bottom");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("text")
        .attr('class', 'maxData')
        .attr("x", width-50)
        .attr("y", 30)
        .attr("dy", ".35em")
        .attr("fill", '#646464')
        .text(d3.max(data, function(d) { return d.Close; }))

    svg.append("text")
        .attr('class', 'minData')
        .attr("x", width-50)
        .attr("y", height-10)
        .attr("dy", ".35em")
        .attr("fill", '#646464')
        .text(d3.min(data, function(d) { return d.Close; }))
  };

  return Chart;
})();
