import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Connector } from "@starknet-react/core";
import { useMediaQuery } from "@mui/system";
import { Grid, Typography, styled } from "@mui/material";
import {
  getConnectorDiscovery,
  getConnectorIcon,
  getConnectorName,
  isInArgentMobileAppBrowser,
  sortConnectors,
} from "@/utils/connectorWrapper";
import { BaseDialogTitle } from "@/components/Base/Dialog/BaseDialogTitle";
import {
  BaseDialogContent,
  BaseDialogWrapper,
} from "@/components/Base/Dialog/StyledDialog";
import { FlexBox } from "@/components/Base/Boxes/StyledBoxes";
import Image from "next/image";

const WalletItemWrapper = styled(FlexBox, {
  shouldForwardProp: (prop) => prop !== "disabled",
})<{ disabled?: boolean }>`
  justify-content: flex-start;
  background: #314156;
  border-radius: 8px;
  opacity: 1;
  cursor: pointer;
  padding: 8px;
`;

const PoweredByArgent = styled("span")`
  font-size: 11px;
  font-weight: 400;
`;

interface SelectWalletModalProps {
  connectors: Connector[];
  isOpen: boolean;
  onSelectWallet: (connector: Connector) => void;
  onClose: () => void;
}

const WalletItem = ({
  connector,
  onSelectWallet,
}: {
  connector: Connector;
  onSelectWallet: (arg0: Connector) => void;
}) => {
  const isAvailable = connector.available();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const needInstall = (connector: Connector, isAvailable: boolean) => {
    if (connector.id === "braavos" && isMobile) {
      return false;
    }
    return !isAvailable;
  };

  const openBraavosMobile = () => {
    window.open(`braavos://dapp/app.starknet.id${router.pathname}`);
  };

  const tryConnect = (connector: Connector, isAvailable: boolean) => {
    if (isAvailable) {
      onSelectWallet(connector);
    } else if (isMobile && connector.id === "braavos") {
      openBraavosMobile();
    } else {
      window.open(getConnectorDiscovery(connector.id));
    }
  };
  return (
    <Grid item xs={12}>
      <WalletItemWrapper
        onClick={() => tryConnect(connector, isAvailable)}
        disabled={!connector.available()}
      >
        <Image
          src={getConnectorIcon(connector.id)}
          alt={connector.id}
          width={40}
          height={40}
        />
        <FlexBox
          sx={{ flexDirection: "column", justifyContent: "center", gap: 0 }}
        >
          <Typography fontWeight={700} fontSize={16}>
            {needInstall(connector, isAvailable) ? "Install " : ""}
            {connector.id === "argentMobile" && isMobile
              ? "Argent"
              : getConnectorName(connector.id)}
          </Typography>
          {connector.id === "argentWebWallet" ? (
            <PoweredByArgent>Powered by Argent</PoweredByArgent>
          ) : null}
        </FlexBox>
      </WalletItemWrapper>
    </Grid>
  );
};

const SelectWalletModal = ({
  connectors,
  isOpen,
  onSelectWallet,
  onClose,
}: SelectWalletModalProps) => {
  const [isArgentMobile, setIsArgentMobile] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (typeof window !== "undefined")
      setIsArgentMobile(isInArgentMobileAppBrowser());
  }, []);

  const filterConnectors = (connectors: Connector[]) => {
    if (isArgentMobile) {
      return connectors.filter((connector) => connector.id === "argentMobile");
    }
    if (!isMobile) return connectors;
    return connectors.filter((connector) => connector.id !== "argentX");
  };

  return (
    <BaseDialogWrapper open={isOpen} onClose={onClose} maxWidth={"xs"}>
      <BaseDialogTitle id="connect_wallet_title" onClose={onClose}>
        Connect your wallet to Starknet
      </BaseDialogTitle>
      <BaseDialogContent>
        <Grid container spacing={2} mt={1}>
          {sortConnectors(filterConnectors(connectors)).map((connector) => (
            <WalletItem
              key={connector.id}
              connector={connector}
              onSelectWallet={onSelectWallet}
            />
          ))}
        </Grid>
      </BaseDialogContent>
    </BaseDialogWrapper>
  );
};

export default SelectWalletModal;
