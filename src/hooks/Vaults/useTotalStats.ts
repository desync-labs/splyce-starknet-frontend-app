import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLazyQuery } from '@apollo/client'
import BigNumber from 'bignumber.js'
import { useAccount } from '@starknet-react/core'
import {
  VAULTS_ACCOUNT_WITHDRAWALS,
  VAULTS_ACCOUNT_DEPOSITS,
} from '@/apollo/queries'
import { IVaultPosition } from '@/utils/TempData'
import { currentNetWork } from '@/utils/network'
import useSyncContext from '@/context/sync'

const TRANSACTIONS_PER_PAGE = 1000

export type TransactionItem = {
  id: string
  timestamp: string
  sharesBurnt: string
  tokenAmount: string
  blockNumber: string
}

const useTotalStats = (
  positionsList: IVaultPosition[],
  positionsLoading: boolean
) => {
  const [depositsList, setDepositsList] = useState<TransactionItem[]>([])
  const [withdrawalsList, setWithdrawalsList] = useState<TransactionItem[]>([])
  const [balanceEarnedLoading, setBalanceEarnedLoading] =
    useState<boolean>(true)

  const network = currentNetWork
  const { address } = useAccount()
  const { lastTransactionBlock } = useSyncContext()

  const [loadAccountDeposits, { loading: depositsLoading }] = useLazyQuery(
    VAULTS_ACCOUNT_DEPOSITS,
    {
      context: { clientName: 'vaults', network },
      variables: { network, first: TRANSACTIONS_PER_PAGE },
      fetchPolicy: 'no-cache',
    }
  )

  const [loadAccountWithdrawals, { loading: withdrawalsLoading }] =
    useLazyQuery(VAULTS_ACCOUNT_WITHDRAWALS, {
      context: { clientName: 'vaults', network },
      variables: { network, first: TRANSACTIONS_PER_PAGE },
      fetchPolicy: 'no-cache',
    })

  const fetchAccountDeposits = useCallback(
    (prevDeposits: TransactionItem[] = []) => {
      if (address) {
        return loadAccountDeposits({
          variables: {
            account: address.toLowerCase(),
            network,
            skip: prevDeposits.length,
            first: TRANSACTIONS_PER_PAGE,
          },
        }).then((res) => {
          if (res.data?.deposits?.length < TRANSACTIONS_PER_PAGE) {
            setDepositsList([...prevDeposits, ...(res.data?.deposits || [])])
          } else {
            fetchAccountDeposits([
              ...prevDeposits,
              ...(res.data?.deposits || []),
            ])
          }
        })
      } else {
        return setDepositsList([])
      }
    },
    [address, setDepositsList, loadAccountDeposits]
  )

  const fetchAccountWithdrawals = useCallback(
    (prevWithdrawals: TransactionItem[] = []) => {
      if (address) {
        return loadAccountWithdrawals({
          variables: {
            account: address.toLowerCase(),
            network,
            skip: prevWithdrawals.length,
            first: TRANSACTIONS_PER_PAGE,
          },
        }).then((res) => {
          if (res.data?.withdrawals?.length < TRANSACTIONS_PER_PAGE) {
            setWithdrawalsList([
              ...prevWithdrawals,
              ...(res.data?.withdrawals || []),
            ])
          } else {
            fetchAccountWithdrawals([
              ...prevWithdrawals,
              ...(res.data?.withdrawals || []),
            ])
          }
        })
      } else {
        return setWithdrawalsList([])
      }
    },
    [address, setDepositsList, loadAccountWithdrawals]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBalanceEarnedLoading(
        positionsLoading || withdrawalsLoading || depositsLoading
      )
    }, 100)

    return () => {
      clearTimeout(timeout)
    }
  }, [
    positionsLoading,
    withdrawalsLoading,
    depositsLoading,
    setBalanceEarnedLoading,
  ])

  const totalBalanceValue = useMemo(() => {
    return positionsList.reduce((acc, position) => {
      return BigNumber(acc).plus(
        BigNumber(position.balancePosition).dividedBy(
          10 ** position.token.decimals
        )
      )
    }, BigNumber(0))
  }, [positionsList])

  useEffect(() => {
    fetchAccountDeposits([])
    fetchAccountWithdrawals([])
  }, [address, fetchAccountDeposits, fetchAccountWithdrawals])

  useEffect(() => {
    if (lastTransactionBlock) {
      fetchAccountDeposits([])
      fetchAccountWithdrawals([])
    }
  }, [lastTransactionBlock])

  const balanceEarned = useMemo(() => {
    if (balanceEarnedLoading) return '-1'

    const sumTokenDeposits = depositsList.reduce(
      (acc: BigNumber, deposit: any) =>
        acc.plus(
          BigNumber(deposit.tokenAmount).dividedBy(10 ** deposit.token.decimals)
        ),
      new BigNumber(0)
    )

    const sumTokenWithdrawals = withdrawalsList.reduce(
      (acc: BigNumber, withdrawal: any) =>
        acc.plus(
          BigNumber(withdrawal.tokenAmount).dividedBy(
            10 ** withdrawal.token.decimals
          )
        ),
      new BigNumber(0)
    )

    return BigNumber(totalBalanceValue || '0')
      .minus(sumTokenDeposits.minus(sumTokenWithdrawals))
      .toString()
  }, [balanceEarnedLoading, totalBalanceValue, depositsList, withdrawalsList])

  return {
    depositsLoading,
    withdrawalsLoading,
    totalBalance: positionsLoading ? '-1' : totalBalanceValue.toString(),
    balanceEarned,
    balanceEarnedLoading,
  }
}

export default useTotalStats
