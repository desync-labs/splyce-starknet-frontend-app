import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useBlockNumber, useProvider } from '@starknet-react/core'

type StakingProviderType = {
  children: ReactNode
}

type UseSyncContextReturn = {
  initialBlock: number | null
  setLastTransactionBlock: Dispatch<number>
  lastTransactionBlock: number | null
}

export const SyncContext = createContext<UseSyncContextReturn>(
  {} as UseSyncContextReturn
)

export const SyncProvider: FC<StakingProviderType> = ({ children }) => {
  const [lastTransactionBlock, setLastTransactionBlock] = useState<
    number | null
  >(null)
  const [initialBlock, setInitialBlock] = useState<number | null>(null)

  const { data, error } = useBlockNumber()

  useEffect(() => {
    if (data) {
      if (!initialBlock) {
        setInitialBlock(data)
      }
      setLastTransactionBlock(data)
    }
  }, [setLastTransactionBlock, setInitialBlock])

  const values = useMemo(() => {
    return {
      initialBlock,
      lastTransactionBlock,
      setLastTransactionBlock,
    }
  }, [setLastTransactionBlock, lastTransactionBlock])

  return <SyncContext.Provider value={values}>{children}</SyncContext.Provider>
}

const useSyncContext = () => useContext(SyncContext)

export default useSyncContext
