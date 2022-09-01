import React from "react";
import "./App.css";
import "chartjs-adapter-moment";
import { getBalance, getTransactions } from "./apis";

import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transactions: [],
      balance: null,
      scale: "day",
    };
  }
  componentDidMount() {
    //API call for balance
    getBalance()
      .then((response) => {
        console.log(JSON.stringify(response));
        this.setState({
          balance: response,
        });
      })
      .catch((error) => {
        console.log(error);
      });

    //API call for transactions
    getTransactions()
      .then((response) => {
        // calculate daily balance and transform to chartjs format
        this.setState({
          transactions: this.transformTransactions(response.transactions),
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
      // if the current day balanace is negative, add it from the total transaction of the current day

      var currentDayBalance = lastDayBalance;
      totalTransactionPerDay[currentDate].forEach((txnOnCurrentDay) => {
        if (txnOnCurrentDay < 0) {
          currentDayBalance += Math.abs(txnOnCurrentDay);
        } else {
          currentDayBalance -= txnOnCurrentDay;
        }
      });

      lastDayBalance = currentDayBalance;

      dailyBalance.push({
        x: new Date(currentDay.valueOf()),
        y: currentDayBalance,
      });

      currentDay.setDate(currentDay.getDate() - 1);
    } while (currentDay >= lowestDate);

    return dailyBalance;
  }

  changeScale(scale) {
    /* get the element id and do the enum things here */
    this.setState({
      scale: scale,
    });
  }

  render() {
    const options = {
      responsive: true,
      scales: {
        x: {
          stacked: true,
          type: "time",
          time: {
            unit: "day",
          },
        },
        y: {
          stacked: true,
        },
      },
    };

    const data = {
      datasets: [
        {
          label: "First dataset",
          data: this.state.transactions,
          fill: true,
          borderColor: "rgb(104, 157, 119)",
          backgroundColor: "rgba(104, 157, 119,.1)",
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
          <button onClick={this.changeScale("week")}>Weekly</button>
          <button onClick={this.changeScale("month")}>Monthly</button>
        </div>
        <Line options={options} data={data} />
      </div>
    );
  }
}

export default App;
