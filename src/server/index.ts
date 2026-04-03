import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { config } from "dotenv"
import { declareDiscoveryExtension } from "@x402/extensions/bazaar";
config()
const app = express();

// Your receiving wallet addresses
const evmAddress = process.env.SERVER_PUBLIC_KEY;

if (evmAddress == undefined) {
    console.log("Server public key must be provided")
    process.exit(1)
}

// Create facilitator client (testnet)
// This connects to the local facilitator, but can also connect to the CDP facilitator (Coinbase)
const facilitatorClient = new HTTPFacilitatorClient({
  url: "http://localhost:4022"
});

// Registers different servers, only ones we will care abt are of course Arb Sepolia and Arb One
const resourceServer = new x402ResourceServer(facilitatorClient)
      .register("eip155:421614", new ExactEvmScheme())

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: 
          {
            // There are two major schemes ive seen which are "exact" and "upto"
            // Exact means the server wants exactly the price shown, and upto means
            // They want upto the price shown.
            scheme: "exact",
            // Price is only able to be shown in dollar format if the network your on has a default stablecoin
            // The code making USDC the default for ArbOne and Sep is merged but at time of writing it has not been
            // Put into an updated NPM package 
            // This is why the README tells you to edit a file in node_modules
            price: "$0.01",
            network: "eip155:421614", // Arb Sepolia
            payTo: evmAddress,
          },
          extensions: {
            // This is for bazaar visibility
            ...declareDiscoveryExtension({
              output: {
                example: {
                  weather: "foggy",
                  temperature: 44
                }
              }
            })
          },
        description: "Todays weather forecast",
        mimeType: "application/json",
      },
    },
    resourceServer
  ),
);

// This is the response that will be sent to the client once the facilitator has acknowledged that
// The server was paid
app.get("/weather", (req, res) => {
  res.send({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  });
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
});