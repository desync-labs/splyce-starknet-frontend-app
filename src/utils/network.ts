import { mainnet, sepolia } from "@starknet-react/chains";

export const currentNetWork =
  process.env.NEXT_PUBLIC_ENV === "prod" ? mainnet.network : sepolia.network;

const ChainIds = {
  [mainnet.network]: mainnet.id,
  [sepolia.network]: sepolia.id,
};

export const currentChainId = ChainIds[currentNetWork];

export const currentRpc =
  process.env.NEXT_PUBLIC_ENV === "prod"
    ? process.env.NEXT_PUBLIC_RPC_URL_MAINNET
    : process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA;

export const SUBGRAPH_URLS = {
  [mainnet.network]: "https://graph.solana.splyce.finance",
  [sepolia.network]: "https://graph2.solana.splyce.finance",
};
