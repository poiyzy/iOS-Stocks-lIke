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
    this.props.onSwitchHistoryPeriod($(e.target).html())
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

    lineChart = new D3Chart('#line-chart');
    lineChart.generateLineChart(data, 'areaLine1');
    lineChart.generateLineArea(data, 'area');

    $('.details').html(null)
    detailsChart = new D3Chart('.details')
    detailsChart.generateLineChart(data, 'areaLine');
    detailsChart.generateBarChart(data, 'bar')

    data2 = data.map(function(d, i) { return {Close: (d.Close * Math.random()), Date: d.Date} })

    $('.news').html(null)
    newsChart = new D3Chart('.news')
    newsChart.generateLineChart(data2, 'areaLine1');
    newsChart.generateLineChart(data, 'areaLine2');
  },

  enableRealTimeChart: function() {
    $("#line-chart").html(null)
    $("#graph-place-holder").html(null);
    lineChart = new LineChart('#line-chart')
    lineChart.generate([{Close: Math.floor((Math.random() * 100) + 1), Date: moment()._d}])

    this.interval = setInterval(function() {
      lineChart.update({Close: Math.floor((Math.random() * 100) + 1), Date: moment()._d})
    }, 2000)
  },

  clearChartGraph: function() {
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
    if (nextProps.startDate == this.props.startDate && nextProps.stockSymbol == this.props.stockSymbol) {
      return
    }
    this.clearChartGraph()
    if (nextProps.startDate == "real-time") {
      this.enableRealTimeChart()
    } else {
      clearInterval(this.interval)
      this.fetchData(nextProps)
    }
  },

  componentDidMount: function() {
    this.fetchData(this.props)
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
});

var StockInfoNav = React.createClass({
  componentWillReceiveProps: function(nextProps) {
    $('.carousel-indicators .active').removeClass("active")
    $('.carousel-indicators .index-' + nextProps.active).addClass("active")
  },

  render: function() {
    return (
      <ol className="carousel-indicators">
        <li className="index-0"></li>
        <li className="index-1"></li>
        <li className="index-2"></li>
      </ol>
    )
  }
});

var StockChartBox = React.createClass({
  getInitialState: function() {
    return {
      currentHistoryPeriod: "6M",
      activedInfoBox: 1
    }
  },

  startDate: function(period) {
    var periodStartDate = {"RT": "real-time", "1W": moment().subtract(7, "day").format("YYYY-MM-DD"), "1M": moment().subtract(30, "day").format("YYYY-MM-DD"), "3M": moment().subtract(90, "day").format("YYYY-MM-DD"), "6M": moment().subtract(180, "day").format("YYYY-MM-DD"), "1Y": moment().subtract(365, "day").format("YYYY-MM-DD"), "2Y": moment().subtract(730, "day").format("YYYY-MM-DD")}

    return (
      periodStartDate[period]
    )
  },

  switchHistoryPeriod: function(period) {
    this.setState({currentHistoryPeriod: period})
  },

  render: function() {
    return (
      <div className="container-fluid graphy">
        <ReactSwipe
          continuous={false}
          startSlide={1}
          callback={function(index, elem) { this.setState({activedInfoBox: index}) }.bind(this)}
        >
          <div className="details">Retriving Data...</div>
          <div className="chart-box">
            <StockChartNav
              onSwitchHistoryPeriod={this.switchHistoryPeriod}
            />

            <StockChartGraph
              startDate={this.startDate(this.state.currentHistoryPeriod)}
              stockSymbol={this.props.stockSymbol}
            />
          </div>
          <div className="news">Retriving Data...</div>
        </ReactSwipe>

        <StockInfoNav active={this.state.activedInfoBox} />
      </div>
    )
  }
});

var StockBox = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      currentStockSymbol: "YHOO",
      windowOrientation: 0
    };
  },

  switchCurrentStock: function(stockSymbol) {
    this.setState({currentStockSymbol: stockSymbol})
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

    window.addEventListener("orientationchange", function() {
      this.setState({windowOrientation: window.orientation})
    }.bind(this), false);
  },

  render: function() {
    if (this.state.windowOrientation == 0 || this.state.windowOrientation == 180) {
      return (
        <div className="main">
          <StockList
            data={this.state.data}
            onSwitchStock={this.switchCurrentStock}
          />
          <StockChartBox
            stockSymbol={this.state.currentStockSymbol}
          />
        </div>
      )
    } else {
      return (
        <div className="main">
          <StockChartBox
            stockSymbol={this.state.currentStockSymbol}
          />
        </div>
      )
    }
  }
});

React.initializeTouchEvents(true)

React.render(
  <StockBox />,
  $('body')[0]
);
