import { http, createConfig } from "@wagmi/core";
import { bscTestnet, bsc } from "@wagmi/core/chains";
import { injected, metaMask, walletConnect, coinbaseWallet } from "@wagmi/connectors";
import { PROJECT_ID } from ".";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

export const wagmiConfig = createConfig({
  chains: [bscTestnet, bsc],
  connectors: [injected(), metaMask(), walletConnect({ projectId: PROJECT_ID })],
  transports: {
    [bscTestnet.id]: http(),
    [bsc.id]: http(),
  },
});

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const config = defaultWagmiConfig({
  chains: [bscTestnet] as const,
  projectId: PROJECT_ID,
  metadata,
  ssr: true,
});
