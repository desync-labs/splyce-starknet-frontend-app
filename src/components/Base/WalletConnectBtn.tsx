import { FC, ReactNode, MouseEvent, useCallback, useState } from 'react'
import { Button, SxProps, Theme, styled } from '@mui/material'

export const WalletButton = styled(Button)`
  border-radius: 8px;
  background: ${({ theme }) => theme.palette.gradients.secondary};
  text-transform: capitalize;
  font-size: 13px;
  line-height: 16px;
  font-weight: bold;
  color: #183102;
  border: 1px solid transparent;
  height: 40px;
  padding: 8px 12px 8px 12px;
  &:hover {
    background: transparent;
    color: ${({ theme }) => theme.palette.action.hover};
    border: 1px solid ${({ theme }) => theme.palette.action.hover};
    cursor: pointer;
    pointer-events: all !important;
  }
`

type WalletConnectBtnPropsTypes = {
  fullwidth?: boolean | undefined
  sx?: SxProps<Theme> | undefined
  testId?: string
  children?: ReactNode
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

const WalletConnectBtn: FC<WalletConnectBtnPropsTypes> = ({
  fullwidth,
  sx,
  testId,
  children,
  onClick,
}) => {
  const [visible, setVisible] = useState(false)

  const openConnectorMenu = useCallback(() => setVisible(true), [setVisible])

  return (
    <WalletButton
      onClick={onClick ? onClick : openConnectorMenu}
      fullWidth={fullwidth}
      sx={sx}
      data-testid={testId}
      aria-hidden={false}
    >
      {children ? children : 'Connect Wallet'}
    </WalletButton>
  )
}

export default WalletConnectBtn
