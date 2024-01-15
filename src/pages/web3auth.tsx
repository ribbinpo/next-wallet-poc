import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import Web3 from "web3";

import { erc20ABI } from "wagmi";
import { ethers } from "ethers";

import { Presets, Client } from "userop";

const clientId =
  "BB9xPWVXYLNwwRYbIjEZqLfNFT_vX3smcqyQclxu9c3odQSnMAjhMQPkLZeL8zROLlyAfMrEQUHrit8pWgYuCMc"; // get from https://dashboard.web3auth.io

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Please use 0x1 for Mainnet
  rpcTarget: "https://rpc.sepolia.org",
  displayName: "Sepolia",
  blockExplorer: "https://sepolia.etherscan.io/",
  ticker: "ETH",
  tickerName: "SepoliaETH",
};

const web3auth = new Web3Auth({
  clientId,
  chainConfig,
  web3AuthNetwork: "sapphire_mainnet",
});

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedIn(true);
    }
  };

  const getUserInfo = async () => {
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    uiConsole("logged out");
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const web3 = new Web3(provider as any);

    // Get user's Ethereum public address
    const address = await web3.eth.getAccounts();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const web3 = new Web3(provider as any);

    // Get user's Ethereum public address
    const address = (await web3.eth.getAccounts())[0];

    // Get user's balance in ether
    const balance = web3.utils.fromWei(
      await web3.eth.getBalance(address), // Balance is in wei
      "ether"
    );
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const web3 = new Web3(provider as any);

    // Get user's Ethereum public address
    const fromAddress = (await web3.eth.getAccounts())[0];

    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const signedMessage = await web3.eth.personal.sign(
      originalMessage,
      fromAddress,
      "test password!" // configure your own password here.
    );
    uiConsole(signedMessage);
  };

  const chainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const web3 = new Web3(provider as any);

   const chainId = await web3.eth.getChainId();

   uiConsole(chainId.toString());
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={chainId} className="card">
            Chain Id
          </button>
        </div>
        <div>
          <button onClick={() => execution()} className="card">
            Test Execution
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  const execution = async () => {
    const rpcUrl = "https://api.stackup.sh/v1/node/d7f0396602825b730050e66f23263dcf709cea531c6706bccf1fc1dc9edfa609";
    const paymasterUrl = "https://api.stackup.sh/v1/paymaster/d7f0396602825b730050e66f23263dcf709cea531c6706bccf1fc1dc9edfa609";
    // Initialize paymaster middleware
    const paymasterContext = { type: "payg" };
    const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
      paymasterUrl,
      paymasterContext
    );
    const opts =
      paymasterUrl.toString() === ""
        ? {}
        : {
            paymasterMiddleware: paymasterMiddleware,
          };

    // Initialize an account

    const signer = await new ethers.BrowserProvider(provider as any).getSigner();

    // const client = createWalletClient({
    //   account: await signer.getAddress() as `0x${string}`,
    //   chain: sepolia,
    //   transport: custom((window as any)?.ethereum),
    // });

    // console.log(signer);
    // console.log(client);

    const builder = await Presets.Builder.SimpleAccount.init(
      signer as any,
      rpcUrl,
      opts
    );

    const address = builder.getSender();
    console.log(`Account address: ${address}`);

    // create the call data
    const tokenAddr = "0x3870419Ba2BBf0127060bCB37f69A1b1C090992B";

    const publicProvider = new ethers.JsonRpcProvider(rpcUrl);

    const erc20 = new ethers.Contract(tokenAddr, erc20ABI, publicProvider);
    const amount = ethers.parseEther("1");;
    // encode function
    const callTo = [tokenAddr];
    const callData = [
      erc20.interface.encodeFunctionData("approve", [await signer.getAddress(), amount]),
    ];

    // Send the User Operation to the ERC-4337 mempool
    const client = await Client.init(rpcUrl);

    const res = await client.sendUserOperation(
      builder.executeBatch(callTo, callData),
      {
        onBuild: (op) => console.log("Signed UserOperation:", op),
      }
    );

    console.log(`UserOpHash: ${res.userOpHash}`);
    console.log("Waiting for transaction...");
    const ev = await res.wait();
    console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
    console.log(
      `View here: https://jiffyscan.xyz/userOpHash/${res.userOpHash}`
    );
  };

  return (
    <div className="container">
      <h1 className="title">
        <a
          target="_blank"
          href="https://web3auth.io/docs/sdk/pnp/web/modal"
          rel="noreferrer"
        >
          Web3Auth{" "}
        </a>
        & NextJS Quick Start
      </h1>

      <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-pnp-examples/tree/main/web-modal-sdk/quick-starts/nextjs-modal-quick-start"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
