import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

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

const renderConnectedContainer = () => {
  return (
    <div className="connected-container">
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <input type="text" placeholder="Enter gif link!" />
        <button type="submit" className="cta-button submit-gif-button">
          Submit
        </button>
      </form>
      <div className="gif-grid">
        {TEST_GIFS.map((gif) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [publicKey, setPublicKey] = useState(undefined);

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
