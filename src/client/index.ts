import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { config } from "dotenv";
// Create signer
config()
const signer = privateKeyToAccount(process.env.EVM_PRIVATE_KEY as `0x${string}`);

// Create x402 client and register schemes
const client = new x402Client();
registerExactEvmScheme(client, { signer });

// Wrap fetch with payment handling
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// Make request - payment is handled automatically
const response = await fetchWithPayment("https://api.example.com/paid-endpoint", {
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
}