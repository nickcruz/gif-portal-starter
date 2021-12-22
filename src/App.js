import React, { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import kp from "./keypair.json";

import idl from "./idl.json";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};

const TEST_GIFS = [
  "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
  "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
  "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
  "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
];

// Constants
const TWITTER_HANDLE = "nick___cruz";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const checkIfPhantomInstalled = () => {
  try {
    const { solana } = window;
    if (solana && solana.isPhantom) {
      console.log("Phantom wallet found!");
      return true;
    } else {
      alert("Phantom wallet not found, go download Phantom!!");
    }
  } catch (error) {
    console.error(error);
  }
  return false;
};

const connectToPhantom = async (onlyIfTrusted) => {
  const { solana } = window;
  try {
    const resp = await solana.connect({ onlyIfTrusted });
    console.log(
      "connected to Phantom wallet, public key:",
      resp.publicKey.toString()
    );
    return resp.publicKey.toString();
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

const renderNotConnectedContainer = (setPublicKey) => (
  <button
    className="cta-button connect-wallet-button"
    onClick={async () => {
      const connectedPublicKey = await connectToPhantom(false);
      setPublicKey(connectedPublicKey);
    }}
  >
    Connect to Wallet
  </button>
);

const App = () => {
  const [publicKey, setPublicKey] = useState(undefined);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState(undefined);

  useEffect(() => {
    const onLoad = async () => {
      if (checkIfPhantomInstalled()) {
        const connectedPublicKey = await connectToPhantom(true);
        setPublicKey(connectedPublicKey);
        console.log("Eagerly connected to Phantom.");
      }
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      setGifList(account.gifList.map(item => item.gifLink));
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(undefined);
    }
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.error("Error creating BaseAccount account:", error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      console.log("Fetching GIF list...");
      getGifList();
    }
  }, [publicKey]);

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log("Gif link:", inputValue);
      setInputValue("");

      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue);

      await getGifList();
    } else {
      console.log("Empty input. Try again.");
    }
  };

  const renderConnectedContainer = () => {
    console.log("gifList:", gifList);
    if (gifList === undefined) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    }
    return (
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={(event) => {
              const { value } = event.target;
              setInputValue(value);
            }}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        <div className="gif-grid">
          {gifList.map((gif) => (
            <div className="gif-item" key={gif}>
              <img src={gif} alt={gif} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className={publicKey ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">Wall of Love portal</p>
          <p className="sub-text">
            View your favorite tweets in the metaverse ✨
          </p>
          {publicKey
            ? renderConnectedContainer()
            : renderNotConnectedContainer(setPublicKey)}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
