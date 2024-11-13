import { ReactNode } from 'react'
import StarknetProvider from './StarknetProvider'
import { AppThemeProvider } from './ThemeProvider'
import { ApolloProvider } from '@apollo/client'
import { client } from '@/apollo/client'
import { SyncProvider } from '@/context/sync'

export { StarknetProvider, AppThemeProvider }

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AppThemeProvider>
      <StarknetProvider>
        <ApolloProvider client={client}>
          <SyncProvider>{children}</SyncProvider>
        </ApolloProvider>
      </StarknetProvider>
    </AppThemeProvider>
  )
}
