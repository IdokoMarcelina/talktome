import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";

// Define Lisk Sepolia chain
const liskSepolia = {
    id: 4202,
    name: 'Lisk Sepolia',
    network: 'lisk-sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'Sepolia Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        public: { http: ['https://rpc.sepolia-api.lisk.com'] },
        default: { http: ['https://rpc.sepolia-api.lisk.com'] },
    },
    blockExplorers: {
        default: { name: 'Lisk Sepolia Explorer', url: 'https://sepolia-blockscout.lisk.com' },
    },
    testnet: true,
}

export const config = getDefaultConfig({
    appName: "Talk2Me",
    projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
    chains: [liskSepolia],
    transports: {
        [liskSepolia.id]: http('https://rpc.sepolia-api.lisk.com'),
    },
});
