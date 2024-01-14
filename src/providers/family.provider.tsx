import { connectKitStyle } from "@/styles/connectkit.style";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

const chains = [polygonMumbai];

export default function FamilyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = createConfig(
    getDefaultConfig({
      // Required API Keys
      // alchemyId: process.env.ALCHEMY_ID, // or infuraId
      walletConnectProjectId: process?.env?.WALLETCONNECT_PROJECT_ID!,

      // Required
      appName: "Next-Family-POC",

      // Optional
      appDescription: "Your App Description",
      appUrl: "https://family.co", // your app's url
      appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
      chains,
    })
  );

  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider customTheme={connectKitStyle}>
        {/* <ConnectKitProvider theme="midnight"> */}
        {/* <ConnectKitProvider
        customTheme={{
          "--ck-font-family": '"Comic Sans MS", "Comic Sans", cursive',
        }}
      > */}
        {children}
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
