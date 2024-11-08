import { ReactNode } from 'react'
import { Chain, mainnet, sepolia } from '@starknet-react/chains'
import { StarknetConfig, jsonRpcProvider } from '@starknet-react/core'
import { getConnectors } from '@/utils/connectorWrapper'
import { defaultEndpoint } from '@/utils/network'

interface StarknetProviderProps {
  children: ReactNode
}

export default function StarknetProvider({ children }: StarknetProviderProps) {
  const chains = [
    process.env.NEXT_PUBLIC_IS_TESTNET === 'true' ? sepolia : mainnet,
  ]
  const providers = jsonRpcProvider({
    rpc: (_chain: Chain) => ({
      nodeUrl: defaultEndpoint,
    }),
  })

  return (
    <StarknetConfig
      chains={chains}
      provider={providers}
      connectors={getConnectors()}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}
