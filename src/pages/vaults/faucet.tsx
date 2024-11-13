import { FC, useEffect, useState } from 'react'
import { Button, CircularProgress, Typography } from '@mui/material'
import { useAccount } from '@starknet-react/core'
import { faucetTestToken } from '@/utils/TempSdkMethods'
import BasePageHeader from '@/components/Base/PageHeader'
import VaultsNestedNav from '@/components/Vaults/NestedNav'
import { BaseInfoIcon } from '@/components/Base/Icons/StyledIcons'
import { BaseErrorBox, BaseInfoBox } from '@/components/Base/Boxes/StyledBoxes'
import { TEST_TOKEN_PUBLIC_KEY } from '@/utils/addresses'
import PageContainer from '@/components/Base/PageContainer'

const FaucetIndex: FC = () => {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { address, account } = useAccount()

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const handleGetTestTokens = async () => {
    if (!address || !account) {
      return
    }

    setLoading(true)
    try {
      const res = await faucetTestToken(address, TEST_TOKEN_PUBLIC_KEY, account)
      console.log('Tx signature:', res)
      setSuccessMessage(true)
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <VaultsNestedNav />
      <PageContainer>
        <BasePageHeader title="Faucet" />
        <Button
          variant="gradient"
          sx={{ marginTop: '24px' }}
          onClick={handleGetTestTokens}
          disabled={loading || successMessage || !address}
        >
          {loading ? <CircularProgress size={20} /> : 'Get test tokens'}
        </Button>
        {successMessage && (
          <BaseInfoBox sx={{ marginTop: '24px' }}>
            <BaseInfoIcon />
            <Typography>You have received 100 Test Splyce USD</Typography>
          </BaseInfoBox>
        )}
        {errorMessage && (
          <BaseErrorBox sx={{ marginTop: '24px', maxWidth: '400px' }}>
            <BaseInfoIcon />
            <Typography>{errorMessage}</Typography>
          </BaseErrorBox>
        )}
      </PageContainer>
    </>
  )
}

export default FaucetIndex
