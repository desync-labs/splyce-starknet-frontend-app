import React, { FunctionComponent, ReactNode } from 'react'
import { styled, Box, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { BaseDialogCloseIcon } from '@/components/Base/Dialog/BaseDialogTitle'
import { BaseDialogWrapper } from '@/components/Base/Dialog/StyledDialog'

const ModalMessageWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px 40px;
`

type ModalMessageProps = {
  title: string
  message: ReactNode
  closeModal: () => void
  open: boolean
  icon?: ReactNode
}

const ModalMessage: FunctionComponent<ModalMessageProps> = ({
  title,
  message,
  closeModal,
  open,
  icon,
}) => {
  return (
    <BaseDialogWrapper
      disableAutoFocus
      open={open}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <BaseDialogCloseIcon aria-label="close" onClick={closeModal}>
        <CloseIcon />
      </BaseDialogCloseIcon>
      <ModalMessageWrapper>
        <Typography variant="h1">{title}</Typography>
        <Box my={2}>{icon && icon}</Box>
        {message}
      </ModalMessageWrapper>
    </BaseDialogWrapper>
  )
}
export default ModalMessage
