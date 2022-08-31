import React, { useRef } from "react";
import "./App.css";
import axios from "axios";
import "chartjs-adapter-moment";

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
    };
  }

  transformTransactions(transactions) {
    /*
    
    x => group by day
    y => balance for the day

    The balance API returns the merchant's current balance.
     In order to plot the cash flow on the chart, you will need to use the list of transactions to calculate a running balance after each day. 
     As the current balance reflects the balance after all these transactions have occurred you will need to work backwards, adding or subtracting each daily amount. 
    
    find current_date_txn_amount

    loop from highest date to the lowest date
        current_date_running_balance = total_balance - current_date_txn
        total_balance = current_date_running_balance
    
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

    console.log("Transactions per day");
    console.log(totalTransactionPerDay);

    //calc current date

    do {
      var currentDate = currentDay.toISOString().slice(0, 10);
      console.log("processing", currentDate);
      console.log("balance", lastDayBalance);

      if (!totalTransactionPerDay[currentDate]) {
        currentDay.setDate(currentDay.getDate() - 1);
        continue;
      }

      // if the current day balance is positive, add it from the total transaction of the current day
      // if the current day balanace is negative, add it from the total transaction of the current day

      var currentDayBalance = lastDayBalance;
      totalTransactionPerDay[currentDate].forEach((txnOnCurrentDay) => {
        currentDayBalance = currentDayBalance + txnOnCurrentDay;
      });

      lastDayBalance = currentDayBalance;
      console.log(currentDayBalance);

      dailyBalance.push({
        x: new Date(currentDay.valueOf()),
        y: currentDayBalance,
      });

      currentDay.setDate(currentDay.getDate() - 1);
    } while (currentDay >= lowestDate);

    return dailyBalance;
    console.log(dailyBalance);
  }

  //assign authorisation key to headers

  componentDidMount() {
    const headers = {
      Authorization:
        "34044a757e0385e54e8c5141bad3bb3abb463727afac3cccb8e31d313db9a370",
    };

    //API call for balance
    axios
      .get(
        "https://uh4goxppjc7stkg24d6fdma4t40wxtly.lambda-url.eu-central-1.on.aws/balances",
        { headers: headers }
      )
      .then((response) => {
        console.log(JSON.stringify(response.data));
        this.setState({
          balance: response.data,
        });
      })
      .catch((error) => {
        console.log(error);
      });

    //API call for transactions

    axios
      .get(
        "https://uh4goxppjc7stkg24d6fdma4t40wxtly.lambda-url.eu-central-1.on.aws/transactions",
        { headers: headers }
      )
      .then((response) => {
        console.log(JSON.stringify(response.data));
        this.setState({
          transactions: this.transformTransactions(response.data.transactions),
        });
      })
      .catch((error) => {
        console.log(error);
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

    console.log(data);

    return (
      <div className="App">
        <h3>Merchant foo</h3>
        <h2>
          {this.state.balance?.amount} {this.state.balance?.currency}
        </h2>
        <Line options={options} data={data} />
      </div>
    );
  }
}

export default App;
