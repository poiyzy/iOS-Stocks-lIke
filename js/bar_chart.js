var BarChart;

BarChart = (function() {
  function BarChart(doomName) {
    this.doomName = doomName
  }

  BarChart.prototype.generate = function(data) {

    var parseDate = d3.time.format("%Y-%m-%d").parse;

    data.forEach(function(d) {
      d.Date = parseDate(d.Date);
      d.Close = +d.Close
    })

    var width = $(this.doomName).width(),
        height = $(this.doomName).height(),
        y = d3.scale.linear().domain([0, d3.max(data, function( d ) { return d.Volume; })]).range([0, height]),
        x = d3.time.scale().domain([data[0].Date, data[data.length - 1].Date]).range([0, width])

    var svg = d3.select(this.doomName)
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

  return BarChart;
})();
