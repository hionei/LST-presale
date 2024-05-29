import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./config/wagmi.ts";
import "./index.css";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { bsc, bscTestnet } from "wagmi/chains";
import { http } from "wagmi";

const queryClient = new QueryClient();
const projectId = "a38b8d94b8d9e5c0b351558a8f22282c";
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://lst.presale.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};
const chains = [bsc, bscTestnet] as const;
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports: {
    [bscTestnet.id]: http(),
    [bsc.id]: http(),
  },
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
