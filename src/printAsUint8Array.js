const { Keypair } = require("@solana/web3.js");
const kp = require("./keypair.json");

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);

console.log("secretKey:");
console.log(secret.toString());

console.log("\npublicKey:");
console.log(Keypair.fromSecretKey(secret).publicKey.toBase58());
