import { useMemo } from "react";
import { useRouter } from "next/router";
import {
  NestedRouteLink,
  NestedRouteNav,
} from "@/components/Base/Nav/NestedNav";

const VaultsNestedNav = () => {
  const location = useRouter();

  const isOverviewActive = useMemo(
    () => ["/vaults"].includes(location.pathname),
    [location.pathname]
  );

  const isFaucetActive = useMemo(
    () => ["/vaults/faucet"].includes(location.pathname),
    [location.pathname]
  );

  const isFaucetBridge = useMemo(
    () => ["/vaults/bridge"].includes(location.pathname),
    [location.pathname]
  );

  return (
    <NestedRouteNav>
      <NestedRouteLink
        className={isOverviewActive ? "active" : ""}
        href="/vaults"
      >
        Vault Management
      </NestedRouteLink>
      <NestedRouteLink
        className={isFaucetActive ? "active" : ""}
        href="/vaults/faucet"
      >
        Faucet
      </NestedRouteLink>
      <NestedRouteLink
        span={2}
        className={isFaucetBridge ? "active" : ""}
        href="/vaults/bridge"
      >
        Bridge
      </NestedRouteLink>
    </NestedRouteNav>
  );
};

export default VaultsNestedNav;
