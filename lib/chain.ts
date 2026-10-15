import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { FUJI_RPC_URL } from "./config";

// Read-only Fuji client. Safe to use on the server and in the browser.
export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(FUJI_RPC_URL),
});
