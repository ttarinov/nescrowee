import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Account, KeyPairSigner, JsonRpcProvider } from "near-api-js";

const CONTRACT_ID = "nescrowee.near";
const WASM_PATH = join(import.meta.dirname, "../contract/target/wasm32-unknown-unknown/release/nescrowee.wasm");
const CREDS_PATH = join(homedir(), `.near-credentials/mainnet/${CONTRACT_ID}.json`);

const creds = JSON.parse(readFileSync(CREDS_PATH, "utf-8"));
const secretKey = creds.private_key || creds.secret_key;
const signer = KeyPairSigner.fromSecretKey(secretKey);
const provider = new JsonRpcProvider({ url: "https://rpc.mainnet.near.org" });
const account = new Account(CONTRACT_ID, provider, signer);

console.log("Deploying to", CONTRACT_ID, "...");
const wasm = readFileSync(WASM_PATH);
console.log("WASM size:", wasm.length, "bytes");

const result = await account.deployContract(wasm);
console.log("Deployed! TX:", result.transaction.hash);
