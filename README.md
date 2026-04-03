
## Overview
Easy setup to run a local Cient, Server(Seller) and Facilitator using the x402 Protocol while having payments on Arbitrum Sepolia

Most of this is from the example from the x402 repo but with all SVM logic removed
<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

npm

## Installation
First run
  ```sh
  npm install 
  ```

Then create three new accounts, one for the `Facilitator`, `Server` and the `Client`. Your `Facilitator` will need Eth, and your `Client` Will need USDC [Faucet here](https://faucet.circle.com/).

 Add their information to the .env file

Then in three separate terminals run the commands in this order
```sh
npm run facilitator
```
```sh
npm run server
```
```sh
npm run client
```

The terminal that ran the client will then retrieve the information that the server provided. You will also be able to see that the server was paid .01 USD and the client lost .01 USD and neither the server nor the client needed Eth to make this transaction