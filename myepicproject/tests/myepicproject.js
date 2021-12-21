const anchor = require("@project-serum/anchor");
const { SystemProgram } = require("@solana/web3.js");

const main = async () => {
  console.log("🚀 Starting test...");

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const baseAccount = anchor.web3.Keypair.generate();

  const program = anchor.workspace.Myepicproject;
  const tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });

  // Fetch data from the account.
  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log("👀 GIF Count", account.totalGifs.toString());

  // Call add_gif!
  await program.rpc.addGif({
    accounts: {
      baseAccount: baseAccount.publicKey,
    },
  });
  console.log("Added GIF.");

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log("👀 GIF Count", account.totalGifs.toString());

  console.log("📝 Your transaction signature", tx);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
