import { useMemo, useState } from "react";
import {
  Connector,
  useAccount,
  useBalance,
  useDisconnect,
} from "@starknet-react/core";
import BigNumber from "bignumber.js";
import { Box, Button, Drawer, styled, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { mainnet, sepolia } from "@starknet-react/chains";

import { BaseDialogCloseIcon } from "@/components/Base/Dialog/BaseDialogTitle";
import { FlexBox } from "@/components/Base/Boxes/StyledBoxes";
import { encodeStr } from "@/utils/common";
import { getConnectorIcon } from "@/utils/connectorWrapper";
import { formatNumberPrice } from "@/utils/format";
import { currentNetWork } from "@/utils/network";
import Image from "next/image";

const StyledDrawer = styled(Drawer)`
  & .MuiDrawer-paper {
    height: auto;
    min-width: 400px;
    top: 70px;
    right: 20px;
    border-radius: 16px;
  }
`;

const DrawerContent = styled(FlexBox)`
  flex-direction: column;
  justify-content: center;
  padding: 24px 20px;
`;

const WalletLogoWrapper = styled(Box)`
  position: relative;
  & img {
    border-radius: 50%;
  }
`;

const DisconnectButton = styled(Button)`
  height: 48px;
  background: #072a40;
  color: #a0f2c4;
  border-radius: 0;
`;

const NativeTokenBalance = styled(FlexBox)`
  justify-content: center;
  width: 100%;
  padding-top: 8px;

  & span {
    font-size: 16px;
    font-weight: 600;
  }
`;

interface WalletInfoModalProps {
  connector: Connector;
  isOpen?: boolean;
  onClose: () => void;
}

const WalletInfoModal = ({
  connector,
  isOpen = false,
  onClose,
}: WalletInfoModalProps) => {
  const [copied, setCopied] = useState<boolean>(false);
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const nativeToken = useMemo(() => {
    return currentNetWork === mainnet.network
      ? mainnet.nativeCurrency
      : sepolia.nativeCurrency;
  }, [currentNetWork]);

  const { data: nativeTokenBalance, error } = useBalance({
    token: nativeToken.address,
    address: address,
    watch: true,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(address as string).then(
      () => {
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      (err) => {
        console.error("Error copy address: ", err);
      }
    );
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <StyledDrawer anchor={"right"} open={isOpen} onClose={onClose}>
      <BaseDialogCloseIcon aria-label="close" onClick={onClose}>
        <CloseIcon />
      </BaseDialogCloseIcon>
      <DrawerContent>
        <WalletLogoWrapper>
          <Image
            src={getConnectorIcon(connector.id)}
            alt={connector.id}
            width={40}
            height={40}
          />
        </WalletLogoWrapper>

        {nativeTokenBalance && (
          <NativeTokenBalance>
            Balance:{" "}
            <span>
              {formatNumberPrice(
                BigNumber(nativeTokenBalance?.value?.toString())
                  .dividedBy(10 ** nativeTokenBalance.decimals)
                  .toNumber()
              )}{" "}
              ETH
            </span>
          </NativeTokenBalance>
        )}
        <FlexBox sx={{ justifyContent: "center", gap: 0 }}>
          <Typography>{encodeStr(address as string, 8)}</Typography>
          <IconButton disabled={copied} onClick={handleCopy}>
            {copied ? (
              <CheckCircleOutlineRoundedIcon
                sx={{ width: "16px", height: "16px" }}
              />
            ) : (
              <ContentCopyRoundedIcon sx={{ width: "16px", height: "16px" }} />
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
  );
};

export default WalletInfoModal;
