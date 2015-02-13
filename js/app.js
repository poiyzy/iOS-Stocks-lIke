var App;

App = (function() {

  function App() {
    this.initialize()
    this.today = new Date();
    this.periodStartDate = {"1D": moment().subtract(1, "day").format("YYYY-MM-DD"), "1W": moment().subtract(7, "day").format("YYYY-MM-DD"), "1M": moment().subtract(30, "day").format("YYYY-MM-DD"), "3M": moment().subtract(90, "day").format("YYYY-MM-DD"), "6M": moment().subtract(360, "day").format("YYYY-MM-DD"), "1Y": moment().subtract(365, "day").format("YYYY-MM-DD"), "2Y": moment().subtract(730, "day").format("YYYY-MM-DD")}
  }

  App.prototype.initialize = function() {
    $.ajax({
      type: "GET",
      url: "http://query.yahooapis.com/v1/public/yql?",
      data: {q: "select * from csv where url='http://download.finance.yahoo.com/d/quotes.csv?s=YHOO,GOOG,AAPL,FB,TWTR,BABA&f=sl1d1t1c1ohgv&e=.csv' and columns='symbol,price,date,time,change,col1,high,low,col2'", format: "json"}
    })
    .done((function(_this) {
      return function(data) {
        stocks = data.query.results.row
        _this.renderStocksList(stocks);

        _this.retriveHistoryData(stocks[0].symbol, _this.periodStartDate["6M"]);
      };
    })(this));
  };

  App.prototype.renderStocksList = function(data) {
    var html = '';

    $.each(data, function(i, d) {
      html += '<div class="row stock'
      if (i == 0) {
        html += " active"
      }
      html += '" data-stock-symbol="' + d.symbol + '">'
      html += '<div class="col-xs-4">' + d.symbol + '</div>'
      html += '<div class="col-xs-4">' + d.price + '</div>'
      html += '<div class="col-xs-4">'
      html += d.change.match(/\+/) ? '<span class="label label-success">' : '<span class="label label-danger">'
      html += d.change + '</span>'
      html += '</div>'
      html += '</div>'
    })

    $(".stockList").html(html);

    this.enableClickToSwitch('.stock');
    this.enableClickToSwitch('.period');
    this.enableRealTimeUpdate('.real-time');
  };

  App.prototype.retriveHistoryData = function(symbol, startDate) {
    $("#line-chart").html(null)
    $("#bar-chart").html(null)
    $("#graph-place-holder").html("Retreving Chart...")

    $.ajax({
      type: "GET",
      url: "http://query.yahooapis.com/v1/public/yql?",
      data: {q: 'select * from yahoo.finance.historicaldata where symbol = "' + symbol + '" and startDate = "' + startDate + '" and endDate = "' + '2015-02-11' + '"', format: 'json', diagnostics: true, env: 'store://datatables.org/alltableswithkeys'}
    })
    .done((function(_this) {
      return function(data) {
        $("#graph-place-holder").html(null);

        stockPrices = data.query.results.quote.reverse()

        barChart = new BarChart('#bar-chart');
        barChart.generate(stockPrices);

        lineChart = new LineChart('#line-chart');
        lineChart.generate(stockPrices);
      };
    })(this));
  };

  App.prototype.enableClickToSwitch = function(target) {
    $(target).click((function(_this) {
      return function(e) {
        $(target).removeClass("active")
        $(e.currentTarget).addClass("active")

        stockSymbol = $('.stock.active').data("stockSymbol")
        startDate = _this.periodStartDate[$('.period.active').html()]
        _this.retriveHistoryData(stockSymbol, startDate);
      }
    })(this));
  };

  App.prototype.enableRealTimeUpdate = function(target) {
    $(target).click((function(_this) {
      return function(e) {
        $('.period').removeClass("active")
        $(e.currentTarget).addClass("active")

        $("#line-chart").html(null)
        var lineChart = new LineChart('#line-chart')
        lineChart.generate([{Close: Math.floor((Math.random() * 100) + 1), Date: moment()._d}])

        setInterval(function() {
          lineChart.update({Close: Math.floor((Math.random() * 100) + 1), Date: moment()._d})
        }, 2000)
      }
    })(this))
  }

  return App;
})();

app = new App;
