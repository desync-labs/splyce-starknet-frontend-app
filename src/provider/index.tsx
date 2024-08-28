import { ReactNode } from 'react'
import StarknetProvider from './StarknetProvider'
import { AppThemeProvider } from './ThemeProvider'

export { StarknetProvider, AppThemeProvider }

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AppThemeProvider>
      <StarknetProvider>{children}</StarknetProvider>
    </AppThemeProvider>
  )
}
