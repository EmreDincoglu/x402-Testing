import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "dotenv";
// Create signer
config()
const signer = privateKeyToAccount(process.env.CLIENT_PRIVATE_KEY as `0x${string}`);

// Create x402 client and register schemes
const client = new x402Client();
registerExactEvmScheme(client, { signer });

// Wrap fetch with payment handling
const fetchWithPayment = wrapFetchWithPayment(fetch, client);


async function requestAndPay(endpoint: string) {
  // Make request - payment is handled automatically
  // An AI agent would only have to set the endpoint below to buy the resource
  const response = await fetchWithPayment(endpoint, {
    method: "GET",
  });
  
  const body = await response.json();
  console.log("Response:", body);
  
  // Get payment receipt from response headers
  if (response.ok) {
    const httpClient = new x402HTTPClient(client);
    const paymentResponse = httpClient.getPaymentSettleResponse(
      (name) => response.headers.get(name)
    );
    console.log("Payment settled:", paymentResponse);
    if (paymentResponse.network == `eip155:42161`) {
      console.log(`ArbiScan Link: https://arbiscan.io/tx/${paymentResponse.transaction}` )
    }
    else if (paymentResponse.network == `eip155:421614`) {
      console.log(`ArbiScan Link: https://sepolia.arbiscan.io/tx/${paymentResponse.transaction}` )
    }
  }
}

const endpoints = ["date", "weather"];
async function main() {
  for (var e in endpoints) {
    await requestAndPay(`http://localhost:4021/${endpoints[e]}`)
  }
}

main()