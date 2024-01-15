import {
  SafeAuthPack,
  SafeAuthConfig,
  SafeAuthInitOptions,
} from "@safe-global/auth-kit";
import { EthersAdapter, SafeFactory } from "@safe-global/protocol-kit";
import { Eip1193Provider, ethers } from "ethers";

export default function SafePage() {
  const safeAuthInitOptions: SafeAuthInitOptions = {
    enableLogging: true,
    showWidgetButton: false,
    chainConfig: {
      chainId: "0xaa36a7", // Please use 0x1 for Mainnet
      rpcTarget: "https://rpc.sepolia.org",
      displayName: "Sepolia",
      ticker: "ETH",
      tickerName: "SepoliaETH",
    },
  };
  const signIn = async () => {
    // Create SafeAuth Instance
    const safeAuthConfig: SafeAuthConfig = {
      txServiceUrl: "",
    };
    const safeAuthPack = new SafeAuthPack();
    await safeAuthPack.init(safeAuthInitOptions);
    // SignIn
    const authKitSignData = await safeAuthPack.signIn();
    console.log(authKitSignData);
    return authKitSignData;
  };
  const signOut = async () => {
    const safeAuthPack = new SafeAuthPack();
    await safeAuthPack.init(safeAuthInitOptions);
    await safeAuthPack.signOut();
  };
  const getProvider = async () => {
    const safeAuthPack = new SafeAuthPack();
    await safeAuthPack.init(safeAuthInitOptions);
    return safeAuthPack.getProvider();
  };
  const createSafeAccount = async () => {
    const ethProvider = new ethers.BrowserProvider(
      (await getProvider()) as Eip1193Provider
    );
    const signer = await ethProvider.getSigner();
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer || ethProvider,
    });

    const safeFactory = await SafeFactory.create({ ethAdapter });
    const authKitSignData = await signIn();
    const safe = await safeFactory.deploySafe({
      safeAccountConfig: { threshold: 1, owners: [authKitSignData?.eoa] },
    });

    console.log('Safe is created', await safe.getAddress());
  };
  return (
    <div>
      <div>Safe</div>
      <button onClick={() => signIn()}>SignIn</button>
      <button onClick={() => signOut()}>SignOut</button>
      <button onClick={() => createSafeAccount()}>Create Safe Account</button>
    </div>
  );
}
