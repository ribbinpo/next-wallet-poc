import { Inter } from "next/font/google";
import { ConnectKitButton } from "connectkit";

import { useAccount, erc20ABI } from "wagmi";
import { ethers } from "ethers";

import { Presets, Client } from "userop";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { connector, address } = useAccount();

  // getSigner
  // console.log(connector?.options.getProvider());
  console.log(connector?.options.getProvider());

  // env
  // Public RPC URL
  // const rpcUrl = "https://public.stackup.sh/api/v1/node/ethereum-sepolia";
  // const paymasterUrl = ""; // Optional - you can get one at https://app.stackup.sh/;

  const rpcUrl = "https://api.stackup.sh/v1/node/d7f0396602825b730050e66f23263dcf709cea531c6706bccf1fc1dc9edfa609";
  const paymasterUrl = "https://api.stackup.sh/v1/paymaster/d7f0396602825b730050e66f23263dcf709cea531c6706bccf1fc1dc9edfa609";

  const execution = async () => {
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
    const signer = await new ethers.BrowserProvider(
      (window as any)?.ethereum as any
    ).getSigner();

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

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const erc20 = new ethers.Contract(tokenAddr, erc20ABI, provider);
    const amount = ethers.parseEther("2");
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
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>
        <ConnectKitButton />
        <button onClick={() => execution()}>Test Execution</button>
      </div>
    </main>
  );
}
