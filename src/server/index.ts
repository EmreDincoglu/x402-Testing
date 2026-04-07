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

const paymentOptions = {
  // Schemes are for types of payments, Exact and upto are the main ones (exactly .01 dollars or upto .01 dollars)
  scheme: "exact", 
  // Price can be in USD if default asset of the chain is supplied, it is on ArbOne and ArbSep
  price: "$0.001", 
  network: "eip155:421614",
  payTo: evmAddress,
}

const routes = {
  "GET /weather": {
    accepts: paymentOptions,
    description: "Todays weather forecast",
    mimeType: "application/json",
    extensions: {
      // This is for bazaar visibility, it adds extra info to what the endpoint returns
      // and is saved in the bazaar, this is NOT shown via the normal endpoint in this case
      // http://localhost:4021/weather
      ...declareDiscoveryExtension({
        //@ts-expect-error (method works but shows err for some reason)
        method: "GET",
        output: {
          example: {
            weather: "Rain", temperature: -40
          }
        }
      })
    },
  },
  "GET /date": {
    accepts: paymentOptions,
    description: "Gives the Date",
    mimeType: "application/json",
    extensions: {
      ...declareDiscoveryExtension({
        //@ts-expect-error
        method: "GET",
        output: {
          example: { date: "11/23/2001", }
        }
      })
    },
  },
}

app.use(
  paymentMiddleware(
    //@ts-expect-error
    routes,
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

app.get("/date", (req, res) => {
  res.send({
    date: "its today lol"
  })
})

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
});