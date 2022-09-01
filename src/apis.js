import axios from "axios";

const headers = {
  Authorization:
    "34044a757e0385e54e8c5141bad3bb3abb463727afac3cccb8e31d313db9a370",
};

export function getTransactions(url) {
  return axios
    .get(
      "https://uh4goxppjc7stkg24d6fdma4t40wxtly.lambda-url.eu-central-1.on.aws/transactions",
      { headers: headers }
    )
    .then((response) => {
      return response.data;
    });
}

export function getBalance(url) {
  return axios
    .get(
      "https://uh4goxppjc7stkg24d6fdma4t40wxtly.lambda-url.eu-central-1.on.aws/balances",
      { headers: headers }
    )
    .then((response) => {
      return response.data;
    });
}
