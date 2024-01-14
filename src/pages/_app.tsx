import FamilyProvider from "@/providers/family.provider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FamilyProvider>
      <Component {...pageProps} />
    </FamilyProvider>
  );
}
