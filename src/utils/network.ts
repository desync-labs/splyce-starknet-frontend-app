export const defaultNetWork =
  process.env.NEXT_PUBLIC_ENV === 'prod' ? 'Mainnet' : 'Devnet'

export const defaultEndpoint = process.env.NEXT_PUBLIC_RPC_URL

export const SUBGRAPH_URLS = {
  Mainnet: 'https://graph.solana.splyce.finance',
  Devnet: 'https://graph2.solana.splyce.finance',
}
