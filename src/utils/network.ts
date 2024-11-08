import { mainnet, sepolia } from '@starknet-react/chains'

export const defaultNetWork =
  process.env.NEXT_PUBLIC_ENV === 'prod' ? mainnet.network : sepolia.network

export const currentRpc =
  process.env.NEXT_PUBLIC_ENV === 'prod'
    ? process.env.NEXT_PUBLIC_RPC_URL_MAINNET
    : process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA

export const SUBGRAPH_URLS = {
  [mainnet.network]: 'https://graph.solana.splyce.finance',
  [sepolia.network]: 'https://graph2.solana.splyce.finance',
}
