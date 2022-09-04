import React from "react";
import "./App.css";
import { getBalance, getTransactions } from "./apis";
import Highcharts from "highcharts/highstock.src";
import moment from "moment";
import HighchartsReact from "highcharts-react-official";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transactions: [],
      balance: 0,
    };
  }
  componentDidMount() {
    //API call for balance
    getBalance()
      .then((response) => {
        this.setState({
          balance: response,
        });

        //API call for transactions
        getTransactions().then((response) => {
          // calculate daily balance and transform to chartjs format
          this.setState({
            transactions: this.transformTransactions(response.transactions),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  transformTransactions(transactions) {
    /*
    this funtion calculates the running balance for everydates and tranfornms it into charjs datastructure  
     */

    // calc total transactions per day and group per day transactions
    const totalTransactionPerDay = transactions.reduce((groups, txn) => {
      const date = txn.date.split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(txn.amount);
      return groups;
    }, {});

    //calc the lowest date
    let lowestDate = new Date(
      Math.min(...Object.keys(totalTransactionPerDay).map((e) => new Date(e)))
    );

    //calc the highest date
    let highestDate = new Date(
      Math.max(...Object.keys(totalTransactionPerDay).map((e) => new Date(e)))
    );

    //assign current day as the highest date
    var currentDay = highestDate;
    var dailyBalance = [];
    var lastDayBalance = this.state.balance.amount;

    //calc current date
    do {
      var currentDate = currentDay.toISOString().slice(0, 10);

      if (!totalTransactionPerDay[currentDate]) {
        currentDay.setDate(currentDay.getDate() - 1);
        continue;
      }

      // if the current day balance is positive, add it from the total transaction of the current day
      // if the current day balanace is negative, subtract it from the total transaction of the current day

      var currentDayBalance = lastDayBalance;
      totalTransactionPerDay[currentDate].forEach((txnOnCurrentDay) => {
        if (txnOnCurrentDay < 0) {
          currentDayBalance += Math.abs(txnOnCurrentDay);
        } else {
          currentDayBalance -= txnOnCurrentDay;
        }
      });

      lastDayBalance = currentDayBalance;

      dailyBalance.push([currentDay.valueOf(), currentDayBalance]);
      currentDay.setDate(currentDay.getDate() - 1);
    } while (currentDay >= lowestDate);

    // Sort the dailybalance before ingesting into HighChart
    dailyBalance.sort(function (a, b) {
      // Compare the 2 dates
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });

    return dailyBalance;
  }
  render() {
    const numberFormat = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    });

    const options = {
      xAxis: {
        type: "datetime",
      },
      yAxis: [
        {
          gridLineColor: "transparent",
          labels: {
            formatter: function () {
              return numberFormat.format(this.value);
            },
            align: "left",
          },
        },
      ],

      tooltip: {
        shared: true,
        formatter: function () {
          return (
            numberFormat.format(this.y, 0) +
            "</b><br/>" +
            moment(this.x).format("MMMM Do YYYY, h:mm")
          );
        },
      },

      chart: {
        height: 700,
        fill: true,
        backgroundColor: "#202124",
      },
      rangeSelector: {
        allButtonsEnabled: true,
        buttons: [
          {
            type: "year",
            count: 1,
            text: "Day",
            dataGrouping: {
              forced: true,
              units: [["day", [1]]],
            },
          },
          {
            type: "year",
            count: 1,
            text: "Week",
            dataGrouping: {
              forced: true,
              units: [["week", [1]]],
            },
          },
          {
            type: "all",
            count: 1,
            text: "Month",
            dataGrouping: {
              forced: true,
              units: [["month", [1]]],
            },
          },
        ],

        buttonTheme: {
          width: 60,
        },
        selected: 2,
      },
      series: [
        {
          data: this.state.transactions,
          tooltip: {
            valueDecimals: 2,
          },
        },
      ],
    };

    return (
      <div className="App">
        <h3>Merchant foo</h3>
        <h2>
          {this.state.balance?.amount} {this.state.balance?.currency}
        </h2>
        <div className="scales">
          <HighchartsReact
            constructorType={"stockChart"}
            highcharts={Highcharts}
            options={options}
            ref={"chart"}
          ></HighchartsReact>
        </div>
      </div>
    );
  }
}

export default App;
