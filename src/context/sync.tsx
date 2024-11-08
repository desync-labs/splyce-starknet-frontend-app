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
import { useStarknetProvider } from '@/provider/StarknetProvider'
import { useProvider } from '@starknet-react/core'

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

  const provider = useProvider()

  useEffect(() => {
    const getLatestSlot = async () => {
      try {
        console.log('Fetching latest block...', provider)
        const latestBlock = await provider.getBlock('latest')
        console.log('Last block:', latestBlock)
        // if (!initialBlock) {
        //   setInitialBlock(latestBlock.block_number)
        // }
        // setLastTransactionBlock(latestBlock.block_number)
      } catch (error) {
        console.error('Error fetching last block: ', error)
        return null
      }
    }

    getLatestSlot()
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
