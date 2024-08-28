import { useState } from 'react'
import { Connector, useDisconnect } from '@starknet-react/core'
import { Box, Button, Drawer, styled, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'

import { BaseDialogCloseIcon } from '@/components/Base/Dialog/BaseDialogTitle'
import { FlexBox } from '@/components/Base/Boxes/StyledBoxes'
import { encodeStr } from '@/utils/common'
import { getConnectorIcon } from '@/utils/connectorWrapper'

const StyledDrawer = styled(Drawer)`
  & .MuiDrawer-paper {
    height: auto;
    min-width: 400px;
    top: 70px;
    right: 20px;
    border-radius: 16px;
  }
`

const DrawerContent = styled(FlexBox)`
  flex-direction: column;
  justify-content: center;
  padding: 24px 20px;
`

const WalletLogoWrapper = styled(Box)`
  position: relative;
  & img {
    border-radius: 50%;
  }
`

const DisconnectButton = styled(Button)`
  height: 48px;
  background: #072a40;
  color: #a0f2c4;
  border-radius: 0;
`

interface WalletInfoModalProps {
  connector: Connector
  address: string
  isOpen?: boolean
  onClose: () => void
}

const WalletInfoModal = ({
  connector,
  address,
  isOpen = false,
  onClose,
}: WalletInfoModalProps) => {
  const [copied, setCopied] = useState<boolean>(false)

  const { disconnect } = useDisconnect()

  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(
      () => {
        setCopied(true)

        setTimeout(() => {
          setCopied(false)
        }, 2000)
      },
      (err) => {
        console.error('Error copy address: ', err)
      }
    )
  }

  const handleDisconnect = () => {
    disconnect()
    onClose()
  }

  return (
    <StyledDrawer anchor={'right'} open={isOpen} onClose={onClose}>
      <BaseDialogCloseIcon aria-label="close" onClick={onClose}>
        <CloseIcon />
      </BaseDialogCloseIcon>
      <DrawerContent>
        <WalletLogoWrapper>
          <img
            src={getConnectorIcon(connector.id)}
            alt={connector.id}
            width={40}
            height={40}
          />
        </WalletLogoWrapper>

        <FlexBox sx={{ justifyContent: 'center', gap: 0 }}>
          <Typography>{encodeStr(address, 8)}</Typography>
          <IconButton disabled={copied} onClick={handleCopy}>
            {copied ? (
              <CheckCircleOutlineRoundedIcon
                sx={{ width: '16px', height: '16px' }}
              />
            ) : (
              <ContentCopyRoundedIcon sx={{ width: '16px', height: '16px' }} />
            )}
          </IconButton>
        </FlexBox>
      </DrawerContent>
      <Box>
        <DisconnectButton fullWidth onClick={handleDisconnect}>
          Disconnect
        </DisconnectButton>
      </Box>
    </StyledDrawer>
  )
}

export default WalletInfoModal
