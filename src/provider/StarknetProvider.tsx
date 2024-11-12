"use client";
import { ReactNode } from "react";
import { mainnet, sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  jsonRpcProvider,
  starkscan,
} from "@starknet-react/core";
import { getConnectors } from "@/utils/connectorWrapper";
import { currentRpc } from "@/utils/network";

interface StarknetProviderProps {
  children: ReactNode;
}

export default function StarknetProvider({ children }: StarknetProviderProps) {
  const chains = [process.env.NEXT_PUBLIC_ENV === "prod" ? mainnet : sepolia];
  const providers = jsonRpcProvider({
    rpc: () => ({
      nodeUrl: currentRpc,
    }),
  });

  return (
    <StarknetConfig
      chains={chains}
      provider={providers}
      connectors={getConnectors()}
      autoConnect
      explorer={starkscan}
    >
      {children}
    </StarknetConfig>
  );
}
