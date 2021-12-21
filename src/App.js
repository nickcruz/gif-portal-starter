import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

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

const connectToPhantom = async () => {
  const { solana } = window;
  try {
    const resp = await solana.connect({ onlyIfTrusted: true });
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

const App = () => {
  const [publicKey, setPublicKey] = useState(undefined);

  useEffect(() => {
    const onLoad = async () => {
      if (checkIfPhantomInstalled()) {
        const connectedPublicKey = await connectToPhantom();
        setPublicKey(connectedPublicKey);
      }
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={async () => {
        const connectedPublicKey = await connectToPhantom();
        setPublicKey(connectedPublicKey);
      }}
    >
      {publicKey ?? "Connect to Wallet"}
    </button>
  );

  return (
    <div className="App">
      <div className={publicKey ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!publicKey && renderNotConnectedContainer()}
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
