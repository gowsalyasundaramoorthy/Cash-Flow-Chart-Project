import { render, screen } from "@testing-library/react";
import App from "./App";
import axios from "axios";
import { waitFor } from "@testing-library/react";
import { getBalance, getTransactions } from "./apis";

test("Test async", async () => {
  // Have API return some random data;
  let data = {
    amount: 10000,
    currency: "EUR",
  };
  axios.get = jest.fn().mockResolvedValue({ data: data });
  render(<App />);
  await expect(getBalance()).resolves.toEqual(data);

  data = {
    transactions: [
      {
        amount: -765,
        currency: "EUR",
        date: "2022-02-07T09:57:27.235Z",
        status: "BOOKED",
      },
    ],
  };
  axios.get = jest.fn().mockResolvedValue({ data: data });
  await expect(getTransactions()).resolves.toEqual(data);

  // const linkElement = screen.getByText(/10000/i);
  const linkElement = screen.getByText(/Merchant foo/i);
  expect(linkElement).toBeInTheDocument();
});
