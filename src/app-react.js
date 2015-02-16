var Stock = React.createClass({
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
      <span className="label label-success">{this.props.data.change}</span> :
      <span className="label label-danger">{this.props.data.change}</span>;

    return (
      <div className="row stock" onClick={this.handleClick}>
        <div className="col-xs-4">{this.props.data.symbol}</div>
        <div className="col-xs-4">{this.props.data.price}</div>
        <div className="col-xs-4">
          {change}
        </div>
      </div>
    );
  }
});

var StockList = React.createClass({
  render: function() {
    return (
      <div className="container-fluid stockList">
        {this.props.data.map(function(d, i) {
          return (
            <Stock data={d} />
          );
        }, this)}
      </div>
    );
  }
});

var StockChartNav = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    $('.period.active').removeClass('active')
    $(e.target).addClass('active')
    this._owner.props.onSwitchHistoryPeriod($(e.target).html())
  },

  render: function() {
    return (
      <div className="row">
        <ul className="nav nav-pills">
          <li onClick={this.handleClick}><a href="#" className="real-time">RT</a></li>
          <li onClick={this.handleClick}><a href="#" className="period">1W</a></li>
          <li onClick={this.handleClick}><a href="#" className="period">1M</a></li>
          <li onClick={this.handleClick}><a href="#" className="period">3M</a></li>
          <li onClick={this.handleClick}><a href="#" className="period active">6M</a></li>
          <li onClick={this.handleClick}><a href="#" className="period">1Y</a></li>
        </ul>
      </div>
    )
  }
});

var StockChartGraph = React.createClass({
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
        this.drawChart(data.query.results.quote)
      }.bind(this)
    });
  },

  componentWillReceiveProps: function(nextProps) {
    this.clearChartGraph()
    this.fetchData(nextProps)
  },

  render: function() {
    return (
      <div className="info">
        <div id="chart">
          <div id="line-chart"></div>
          <div id="bar-chart"></div>
          <div id="graph-place-holder"></div>
        </div>
      </div>
    )
  }
})

var StockChartBox = React.createClass({
  startDate: function(period) {
    var periodStartDate = {"1D": moment().subtract(1, "day").format("YYYY-MM-DD"), "1W": moment().subtract(7, "day").format("YYYY-MM-DD"), "1M": moment().subtract(30, "day").format("YYYY-MM-DD"), "3M": moment().subtract(90, "day").format("YYYY-MM-DD"), "6M": moment().subtract(180, "day").format("YYYY-MM-DD"), "1Y": moment().subtract(365, "day").format("YYYY-MM-DD"), "2Y": moment().subtract(730, "day").format("YYYY-MM-DD")}

    return (
      periodStartDate[period]
    )
  },

  render: function() {
    return (
      <div className="container-fluid graphy">
        <StockChartNav />

        <StockChartGraph
          startDate={this.startDate(this.props.historyPeriod)}
          stockSymbol={this.props.stockSymbol}
        />

        <ol className="carousel-indicators">
          <li data-target="#chart" data-slide-to="0"></li>
          <li data-target="#chart" data-slide-to="1" className="active"></li>
          <li data-target="#chart" data-slide-to="2"></li>
        </ol>
      </div>
    )
  }
});

var StockBox = React.createClass({
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
      <div className="main">
        <StockList
          data={this.state.data}
          onSwitchStock={this.switchCurrentStock}
        />
        <StockChartBox
          stockSymbol={this.state.currentStockSymbol}
          historyPeriod={this.state.currentHistoryPeriod}
          onSwitchHistoryPeriod={this.switchHistoryPeriod}
        />
      </div>
    )
  }
});

React.initializeTouchEvents(true)
React.render(
  <StockBox />,
  $('body')[0]
);