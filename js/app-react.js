var Stock = React.createClass({displayName: "Stock",
  handleClick: function(e) {
    e.preventDefault();
    $('.stock.active').removeClass('active')
    $(this.getDOMNode()).addClass('active')
    this._owner.props.onSwitchStock(this.props.data.symbol)
  },

  componentDidMount: function() {
    this.checkDefaultActive()
  },

  checkDefaultActive: function() {
    if (this._mountIndex == 0) {
      $(this.getDOMNode()).addClass('active')
    }
  },

  render: function() {
    var change = this.props.data.change.match(/\+/) ?
      React.createElement("span", {className: "label label-success"}, this.props.data.change) :
      React.createElement("span", {className: "label label-danger"}, this.props.data.change);

    return (
      React.createElement("div", {className: "row stock", onClick: this.handleClick}, 
        React.createElement("div", {className: "col-xs-4"}, this.props.data.symbol), 
        React.createElement("div", {className: "col-xs-4"}, this.props.data.price), 
        React.createElement("div", {className: "col-xs-4"}, 
          change
        )
      )
    );
  }
});

var StockList = React.createClass({displayName: "StockList",
  render: function() {
    return (
      React.createElement("div", {className: "container-fluid stockList"}, 
        this.props.data.map(function(d, i) {
          return (
            React.createElement(Stock, {data: d})
          );
        }, this)
      )
    );
  }
});

var StockChartNav = React.createClass({displayName: "StockChartNav",
  handleClick: function(e) {
    e.preventDefault();
    $('.period.active').removeClass('active')
    $(e.target).addClass('active')
    this._owner.props.onSwitchHistoryPeriod($(e.target).html())
  },

  render: function() {
    return (
      React.createElement("div", {className: "row"}, 
        React.createElement("ul", {className: "nav nav-pills"}, 
          React.createElement("li", {onClick: this.handleClick}, React.createElement("a", {href: "#", className: "real-time"}, "RT")), 
          React.createElement("li", {onClick: this.handleClick}, React.createElement("a", {href: "#", className: "period"}, "1W")), 
          React.createElement("li", {onClick: this.handleClick}, React.createElement("a", {href: "#", className: "period"}, "1M")), 
          React.createElement("li", {onClick: this.handleClick}, React.createElement("a", {href: "#", className: "period"}, "3M")), 
          React.createElement("li", {onClick: this.handleClick}, React.createElement("a", {href: "#", className: "period active"}, "6M")), 
          React.createElement("li", {onClick: this.handleClick}, React.createElement("a", {href: "#", className: "period"}, "1Y"))
        )
      )
    )
  }
});

var StockChartGraph = React.createClass({displayName: "StockChartGraph",
  drawChart: function(data) {
    $("#graph-place-holder").html(null);

    barChart = new BarChart('#bar-chart');
    barChart.generate(data);

    lineChart = new LineChart('#line-chart');
    lineChart.generate(data);
  },

  clearChartGraph: function() {
    $('#bar-chart').html(null);
    $('#line-chart').html(null);
    $("#graph-place-holder").html("Retreving Chart...")
  },

  fetchData: function(params) {
    $.ajax({
      type: "GET",
      url: "http://query.yahooapis.com/v1/public/yql?",
      data: {q: 'select * from yahoo.finance.historicaldata where symbol = "' + params.stockSymbol + '" and startDate = "' + params.startDate + '" and endDate = "' + moment().format('YYYY-MM-DD') + '"', format: 'json', diagnostics: true, env: 'store://datatables.org/alltableswithkeys'},
      success: function(data) {
        this.drawChart(data.query.results.quote.reverse())
      }.bind(this)
    });
  },

  componentWillReceiveProps: function(nextProps) {
    this.clearChartGraph()
    this.fetchData(nextProps)
  },

  render: function() {
    return (
      React.createElement("div", {className: "info"}, 
        React.createElement("div", {id: "chart"}, 
          React.createElement("div", {id: "line-chart"}), 
          React.createElement("div", {id: "bar-chart"}), 
          React.createElement("div", {id: "graph-place-holder"})
        )
      )
    )
  }
})

var StockChartBox = React.createClass({displayName: "StockChartBox",
  startDate: function(period) {
    var periodStartDate = {"1D": moment().subtract(1, "day").format("YYYY-MM-DD"), "1W": moment().subtract(7, "day").format("YYYY-MM-DD"), "1M": moment().subtract(30, "day").format("YYYY-MM-DD"), "3M": moment().subtract(90, "day").format("YYYY-MM-DD"), "6M": moment().subtract(180, "day").format("YYYY-MM-DD"), "1Y": moment().subtract(365, "day").format("YYYY-MM-DD"), "2Y": moment().subtract(730, "day").format("YYYY-MM-DD")}

    return (
      periodStartDate[period]
    )
  },

  render: function() {
    return (
      React.createElement("div", {className: "container-fluid graphy"}, 
        React.createElement(StockChartNav, null), 

        React.createElement(StockChartGraph, {
          startDate: this.startDate(this.props.historyPeriod), 
          stockSymbol: this.props.stockSymbol}
        ), 

        React.createElement("ol", {className: "carousel-indicators"}, 
          React.createElement("li", {"data-target": "#chart", "data-slide-to": "0"}), 
          React.createElement("li", {"data-target": "#chart", "data-slide-to": "1", className: "active"}), 
          React.createElement("li", {"data-target": "#chart", "data-slide-to": "2"})
        )
      )
    )
  }
});

var StockBox = React.createClass({displayName: "StockBox",
  getInitialState: function() {
    return {
      data: [],
      currentStockSymbol: "YHOO",
      currentHistoryPeriod: "6M"
    };
  },

  switchCurrentStock: function(stockSymbol) {
    this.setState({currentStockSymbol: stockSymbol})
  },

  switchHistoryPeriod: function(period) {
    this.setState({currentHistoryPeriod: period})
  },

  componentDidMount: function() {
    $.ajax({
      type: "GET",
      url: "http://query.yahooapis.com/v1/public/yql?",
      data: {q: "select * from csv where url='http://download.finance.yahoo.com/d/quotes.csv?s=YHOO,GOOG,AAPL,FB,TWTR,BABA&f=sl1d1t1c1ohgv&e=.csv' and columns='symbol,price,date,time,change,col1,high,low,col2'", format: "json"},
      success: function(data) {
        this.setState({data: data.query.results.row})
      }.bind(this)
    });
  },

  render: function() {
    return (
      React.createElement("div", {className: "main"}, 
        React.createElement(StockList, {
          data: this.state.data, 
          onSwitchStock: this.switchCurrentStock}
        ), 
        React.createElement(StockChartBox, {
          stockSymbol: this.state.currentStockSymbol, 
          historyPeriod: this.state.currentHistoryPeriod, 
          onSwitchHistoryPeriod: this.switchHistoryPeriod}
        )
      )
    )
  }
});

React.initializeTouchEvents(true)
React.render(
  React.createElement(StockBox, null),
  $('body')[0]
);
