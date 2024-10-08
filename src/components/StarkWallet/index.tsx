import { useCallback, useEffect, useState } from 'react'
import { Typography, styled, Box, Button } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { AccountBalanceWallet as AccountBalanceWalletIcon } from '@mui/icons-material'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'

import SelectWalletModal from './SelectWalletModal'
import { FlexBox } from '@/components/Base/Boxes/StyledBoxes'
import ModalMessage from '@/components/AppLayout/ModalMessage'
import WalletInfoModal from '@/components/StarkWallet/WalletInfoModal'
import { bigintToStringHex, encodeStr } from '@/utils/common'
import { getConnectorIcon } from '@/utils/connectorWrapper'
import { mainnet, sepolia } from '@starknet-react/chains'
import { BaseButtonSecondary } from '@/components/Base/Buttons/StyledButtons'

const WalletInfo = styled(FlexBox)`
  justify-content: flex-end;
  width: fit-content;
  gap: 0;
  background-color: #072a40;
  border-radius: 8px;
  cursor: pointer;
  padding: 4px 16px;

  & img {
    margin-right: 8px;
  }

  & svg {
    margin-right: -8px;
  }
`

const StarkWallet = () => {
  const [visibleWalletsModal, setVisibleWalletsModal] = useState(false)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const [isWalletDrawerShown, setIsWalletDrawerShown] = useState(false)

  const { connect, connectors, status, connector } = useConnect()
  const { address, account, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === 'true' ? 'testnet' : 'mainnet'

  useEffect(() => {
    if (!isConnected || !account) return
    account.getChainId().then((chainId) => {
      const isWrongNetwork =
        (chainId === bigintToStringHex(sepolia.id) && network === 'mainnet') ||
        (chainId === bigintToStringHex(mainnet.id) && network === 'testnet')
      setIsWrongNetwork(isWrongNetwork)
    })
  }, [account, network, isConnected])

  const handleShowWalletDrawer = () => setIsWalletDrawerShown(true)
  const handleCloseWalletDrawer = () => setIsWalletDrawerShown(false)

  const handleWalletsModalClose = useCallback(
    () => setVisibleWalletsModal(false),
    [setVisibleWalletsModal]
  )
  const handleWalletsModalOpen = useCallback(
    () => setVisibleWalletsModal(true),
    [setVisibleWalletsModal]
  )

  const handleSelectWallet = (connector) => {
    connect({ connector })
    handleWalletsModalClose()
  }

  const disconnectByClick = (): void => {
    disconnect()
    setIsWrongNetwork(false)
  }

  if (isConnected && connector && address)
    return (
      <>
        <FlexBox sx={{ justifyContent: 'flex-end' }}>
          <WalletInfo onClick={handleShowWalletDrawer}>
            <img
              src={getConnectorIcon(connector.id)}
              alt={connector.id}
              width={20}
              height={20}
            />
            <Typography>{encodeStr(address, 4)}</Typography>
            <KeyboardArrowDownRoundedIcon />
          </WalletInfo>
        </FlexBox>
        <WalletInfoModal
          connector={connector}
          address={address}
          isOpen={isWalletDrawerShown}
          onClose={handleCloseWalletDrawer}
        />
        <ModalMessage
          open={isWrongNetwork}
          title={'Wrong network'}
          closeModal={() => setIsWrongNetwork(false)}
          message={
            <>
              <Typography mb={2}>
                This app only supports Starknet {network}, you have to change
                your network to be able use it.
              </Typography>
              <BaseButtonSecondary onClick={() => disconnectByClick()}>
                Disconnect
              </BaseButtonSecondary>
            </>
          }
          icon={
            <CancelRoundedIcon
              sx={{
                color: 'rgb(210, 46, 46)',
                width: '100px',
                height: '100px',
              }}
            />
          }
        />
      </>
    )
  return (
    <>
      <IconButton color="inherit" onClick={handleWalletsModalOpen}>
        <AccountBalanceWalletIcon />
      </IconButton>
      <SelectWalletModal
        connectors={connectors}
        isOpen={visibleWalletsModal}
        onClose={handleWalletsModalClose}
        onSelectWallet={handleSelectWallet}
      />
    </>
  )
}

export default StarkWallet
