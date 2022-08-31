# APIs

## Call API to fetch transactions

URL => https://uh4goxppjc7stkg24d6fdma4t40wxtly.lambda-url.eu-central-1.on.aws/transactions  

Headers => Authorization (34044a757e0385e54e8c5141bad3bb3abb463727afac3cccb8e31d313db9a370)

```json
{
"transactions": [
{
"amount": -765,
"currency": "EUR",
"date": "2022-02-07T09:57:27.235Z",
"status": "BOOKED"
}
]
}
```

## Call API to fetch balance

URL => https://uh4goxppjc7stkg24d6fdma4t40wxtly.lambda-url.eu-central-1.on.aws/balances  

Headers => Authorization (34044a757e0385e54e8c5141bad3bb3abb463727afac3cccb8e31d313db9a370)

```json
{
"amount": 10000,
"currency": "EUR"
}
```