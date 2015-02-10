var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

drawBarChart("#bar-chart", dataset);
drawLineChart("#line-chart", dataset);

function drawBarChart(doomName, data) {
  var width = $(doomName).width(),
      height = $(doomName).height(),
      y = d3.scale.linear().domain([0, d3.max(data)]).range([0, height]),
      x = d3.scale.linear().domain([0, data.length]).range([0, width])

  var svg = d3.select(doomName)
                .append("svg")
                .attr("width", width)
                .attr("height", height)

  svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        return x(i);
      })
      .attr("y", function(d) {
        return height - y(d);
      })
      .attr("width", width / data.length - 2)
      .attr("height", function(d) {
        return y(d);
      })
      .attr("fill", "#363636")
      .attr("opacity", .85);
}

function drawLineChart(doomName, data) {
  var width = $(doomName).width(),
      height = $(doomName).height(),
      marginTop = 20;

  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.linear().range([height, marginTop]);

  var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

  var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("right");

  var area = d3.svg.area()
                .x(function(d, i) { return x(i); })
                .y0(height)
                .y1(function(d) { return y(d); });

  var svg = d3.select(doomName).append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(5, -20)")
                .attr("fill", "#363636")
                .attr("opacity", .85)

  x.domain([0, data.length]);
  y.domain([0, d3.max(data, function(d) { return d; })]);

  svg.append("path")
      .datum(data)
      .attr('class', 'area')
      .attr("d", area)

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .attr("transform","translate(" + (width - 10) + ", 0)")
      .call(yAxis)
      .append("text")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");
}
