import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useLazyQuery } from "@apollo/client";
import BigNumber from "bignumber.js";
import { useAccount } from "@starknet-react/core";

import dayjs from "dayjs";
import {
  getDefaultVaultTitle,
  vaultTitle,
} from "@/utils/Vaults/getVaultTitleAndDescription";
import {
  dummyVaultMethods,
  IVault,
  IVaultPosition,
  IVaultStrategy,
  IVaultStrategyReport,
  VaultType,
} from "@/utils/TempData";
import {
  VAULT,
  VAULT_POSITION,
  VAULT_POSITION_TRANSACTIONS,
  VAULT_STRATEGY_REPORTS,
} from "@/apollo/queries";
import { vaultType } from "@/utils/Vaults/getVaultType";
import {
  getTfVaultPeriods,
  getUserTokenBalance,
  previewRedeem,
} from "@/utils/TempSdkMethods";
import useSyncContext from "@/context/sync";
import { TRADE_FI_VAULT_REPORT_STEP } from "@/utils/Constants";
import { useAprNumber } from "@/hooks/Vaults/useApr";

const VAULT_REPORTS_PER_PAGE = 1000;

enum TransactionFetchType {
  FETCH = "fetch",
  PROMISE = "promise",
}

export enum VaultInfoTabs {
  ABOUT = "about",
  STRATEGIES = "strategies",
  MANAGEMENT_VAULT = "management-vault",
  MANAGEMENT_STRATEGY = "management-strategy",
}

export type IVaultStrategyHistoricalApr = {
  id: string;
  apr: string;
  timestamp: string;
};

const useVaultDetail = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { lastTransactionBlock } = useSyncContext();

  const vaultId = router.query.vaultId as string;
  const tab = router.query.tab as string;

  const [vault, setVault] = useState<IVault>({} as IVault);
  const [vaultAddress, setVaultAddress] = useState<string>("");
  const [vaultPosition, setVaultPosition] = useState<IVaultPosition>(
    {} as IVaultPosition
  );
  const [balanceToken, setBalanceToken] = useState<string>("0");

  const [depositsList, setDepositsList] = useState([]);
  const [withdrawalsList, setWithdrawalsList] = useState([]);
  const [performanceFee, setPerformanceFee] = useState("0");

  const [minimumDeposit, setMinimumDeposit] = useState<number>(0.0000000001);

  const [updateVaultPositionLoading, setUpdateVaultPositionLoading] =
    useState<boolean>(false);
  const [fetchBalanceLoading, setFetchBalanceLoading] =
    useState<boolean>(false);

  const [reports, setReports] = useState<
    Record<string, IVaultStrategyReport[]>
  >({});
  const [isReportsLoaded, setIsReportsLoaded] = useState<boolean>(false);

  const [historicalApr, setHistoricalApr] = useState<
    Record<string, IVaultStrategyHistoricalApr[]>
  >({});

  const [managedStrategiesIds, setManagedStrategiesIds] = useState<string[]>(
    []
  );
  const [isUserManager, setIsUserManager] = useState<boolean>(false);

  const [isTfVaultType, setIsTfVaultType] = useState<boolean>(false);
  const [isUserKycPassed, setIsUserKycPassed] = useState<boolean>(true);
  const [tfVaultDepositEndDate, setTfVaultDepositEndDate] = useState<
    string | null
  >(null);
  const [tfVaultLockEndDate, setTfVaultLockEndDate] = useState<string | null>(
    null
  );

  const [tfVaultDepositEndTimeLoading, setTfVaultDepositEndTimeLoading] =
    useState<boolean>(false);
  const [tfVaultLockEndTimeLoading, setTfVaultLockEndTimeLoading] =
    useState<boolean>(false);

  const [activeTfPeriod, setActiveTfPeriod] = useState<number>(1);
  const [tfVaultDepositLimit, setTfVaultDepositLimit] = useState<string>("0");

  const [activeVaultInfoTab, setActiveVaultInfoTab] = useState<VaultInfoTabs>(
    VaultInfoTabs.ABOUT
  );

  const [vaultMethods, setVaultMethods] = useState<any[]>(dummyVaultMethods);
  const [strategyMethods, setStrategyMethods] =
    useState<any[]>(dummyVaultMethods);
  const [isWithdrawAllLoading, setIsWithdrawAllLoading] =
    useState<boolean>(false);
  const [isShowWithdrawAllButtonLoading, setIsShowWithdrawAllButtonLoading] =
    useState<boolean>(true);

  const apr = useAprNumber(vault);

  const [loadVault, { loading: vaultLoading }] = useLazyQuery(VAULT, {
    context: { clientName: "vaults" },
    fetchPolicy: "no-cache",
  });

  const [loadPosition, { loading: vaultPositionLoading }] = useLazyQuery(
    VAULT_POSITION,
    {
      context: { clientName: "vaults" },
      variables: { first: 1000 },
      fetchPolicy: "no-cache",
    }
  );

  const [loadReports, { loading: reportsLoading }] = useLazyQuery(
    VAULT_STRATEGY_REPORTS,
    {
      context: { clientName: "vaults" },
      fetchPolicy: "no-cache",
    }
  );

  const [loadPositionTransactions, { loading: transactionsLoading }] =
    useLazyQuery(VAULT_POSITION_TRANSACTIONS, {
      context: { clientName: "vaults" },
      variables: { first: 1000 },
      fetchPolicy: "no-cache",
    });

  useEffect(() => {
    if (
      vaultId &&
      vaultType[vaultId.toLowerCase()] &&
      vaultType[vaultId.toLowerCase()] === VaultType.TRADEFI
    ) {
      setIsTfVaultType(true);
    } else {
      setIsTfVaultType(false);
    }
  }, [vaultId]);

  useEffect(() => {
    if (tab) {
      setActiveVaultInfoTab(tab as VaultInfoTabs);
    }
  }, [tab]);

  const updateVaultDepositLimit = async (
    vaultData: IVault,
    account: string
  ) => {
    let depositLimitValue = vaultData.depositLimit;
    try {
      const type = vaultType[vaultData.id.toLowerCase()] || VaultType.DEFAULT;

      // depositLimitValue = await vaultService.getDepositLimit(
      //   vaultData.id,
      //   type === VaultType.TRADEFI,
      //   account
      // )

      if (type === VaultType.TRADEFI && !account) {
        depositLimitValue = "0";
      }

      if (
        type === VaultType.TRADEFI &&
        BigNumber(depositLimitValue).isEqualTo(0)
      ) {
        depositLimitValue = BigNumber(vaultData.strategies[0].maxDebt)
          .minus(vaultData.balanceTokens)
          .toString();
      }

      setTfVaultDepositLimit(depositLimitValue);

      const updatedVault = {
        ...vaultData,
        depositLimit: BigNumber(depositLimitValue).toString(),
        name: vaultTitle[vaultData.id.toLowerCase()]
          ? vaultTitle[vaultData.id.toLowerCase()]
          : getDefaultVaultTitle(
              vaultType[vaultData.id.toLowerCase()] || VaultType.DEFAULT,
              //vaultData.token.name,
              vaultData.token.id ===
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                ? "USDC"
                : "tspUSD",
              vaultData.id
            ),
        type,
        token: {
          ...vaultData.token,
          symbol:
            vaultData.token.id ===
            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
              ? "USDC"
              : "tspUSD",
          name:
            vaultData.token.id ===
            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
              ? "USD Coin"
              : "Test Splyce USD",
        },
      };

      setVault(updatedVault);

      /**
       * Min Deposit for TradeFlow vaults is 10,000
       * Min Deposit for other vaults is 0.0000000001
       */
      // setMinimumDeposit(
      //   updatedVault.type === VaultType.TRADEFI ? 10000 : 0.0000000001
      // )
      setMinimumDeposit(0.0000000001);

      return updatedVault;
    } catch (error) {
      console.error("Error updating vault deposit limit:", error);
      setVault(vaultData);
      return vaultData;
    }
  };

  const fetchVault = useCallback(
    (vaultId: string) => {
      loadVault({
        variables: {
          id: vaultId,
        },
      }).then(async (res) => {
        if (!res.data?.vault) {
          router.push("/vaults");
        } else {
          let vaultData = res.data.vault;

          setVault(vaultData);
          setPerformanceFee(
            BigNumber(vaultData.performanceFees).dividedBy(100).toString()
          );
          setVaultAddress(vaultData.id);

          vaultData = await updateVaultDepositLimit(vaultData, address || "");
          /**
           * Fetch additional data for strategies
           */
          if (
            vaultData &&
            vaultData?.strategies &&
            vaultData?.strategies?.length
          ) {
            if (vaultData.type === VaultType.TRADEFI) {
              const strategies = vaultData?.strategies.map(
                (strategy: IVaultStrategy) => {
                  return {
                    ...strategy,
                    isShutdown: false,
                  };
                }
              );

              setVault({
                ...vaultData,
                strategies,
              });
            } else {
              const promises: Promise<boolean>[] = [];
              vaultData?.strategies.forEach((strategy: IVaultStrategy) => {
                //promises.push(vaultService.isStrategyShutdown(strategy.id))
                promises.push(Promise.resolve(false));
              });

              Promise.all(promises).then((response) => {
                const strategies = vaultData?.strategies.map(
                  (strategy: IVaultStrategy, index: number) => {
                    return {
                      ...strategy,
                      isShutdown: response[index],
                    };
                  }
                );

                setVault({
                  ...vaultData,
                  strategies,
                });
              });
            }
          }
        }
      });
    },
    [loadVault, setVault, router.query.vaultId, address]
  );

  const fetchReports = (
    strategyId: string,
    prevStateReports: IVaultStrategyReport[] = [],
    prevStateApr: IVaultStrategyHistoricalApr[] = [],
    isTfVault = false
  ) => {
    loadReports({
      variables: {
        strategy: strategyId,
        reportsFirst: VAULT_REPORTS_PER_PAGE,
        reportsSkip: prevStateReports.length,
      },
    }).then((response) => {
      const { data } = response;

      if (
        data?.strategyReports &&
        data?.strategyReports?.length &&
        data?.strategyReports?.length % VAULT_REPORTS_PER_PAGE === 0
      ) {
        fetchReports(
          strategyId,
          [...prevStateReports, ...(data?.strategyReports || [])],
          [...prevStateApr, ...(data?.strategyHistoricalAprs || [])],
          isTfVault
        );
      } else {
        setReports((prev) => ({
          ...prev,
          [strategyId]: [...prevStateReports, ...(data?.strategyReports || [])],
        }));
        if (!isTfVault) {
          setHistoricalApr((prev) => ({
            ...prev,
            [strategyId]: [
              ...prevStateApr,
              ...(data?.strategyHistoricalAprs || []),
            ],
          }));
        }

        setIsReportsLoaded(true);
      }
    });
  };

  const fetchVaultPosition = useCallback(
    (vaultId: string, address: string): Promise<IVaultPosition> => {
      return new Promise((resolve) => {
        loadPosition({
          variables: {
            account: address.toLowerCase(),
            vault: vaultId,
          },
        }).then(async (res) => {
          if (
            res.data?.accountVaultPositions &&
            res.data?.accountVaultPositions.length
          ) {
            const position = res.data.accountVaultPositions[0];

            try {
              setUpdateVaultPositionLoading(true);
              const balance = (await getUserTokenBalance(
                address,
                position.shareToken.id
              )) as string;

              let previewRedeemValue = "0";

              if (BigNumber(balance).isGreaterThan(0)) {
                previewRedeemValue = (
                  await previewRedeem(balance as string, position.vault.id)
                ).toString();
                previewRedeemValue = BigNumber(previewRedeemValue).toString();
              }

              const updatedVaultPosition = {
                ...position,
                balanceShares: balance,
                balancePosition: previewRedeemValue,
              };

              resolve(updatedVaultPosition);
            } catch (error) {
              console.error("Error updating vault position:", error);
              resolve(position);
            } finally {
              setUpdateVaultPositionLoading(false);
            }
          } else {
            resolve({} as IVaultPosition);
          }
        });
      });
    },
    [loadPosition, setUpdateVaultPositionLoading]
  );

  const fetchBalanceToken = useCallback(
    (vaultPosition: IVaultPosition) => {
      if (!vaultPosition?.balanceShares) {
        return Promise.resolve("0");
      }

      setFetchBalanceLoading(true);
      return previewRedeem(vaultPosition?.balanceShares as string, vault.id)
        .catch((error) => {
          console.error("Error fetching balance token:", error);
          return "-1";
        })
        .finally(() => setFetchBalanceLoading(false));
    },
    [vault.id, setFetchBalanceLoading]
  );

  const fetchPositionTransactions = useCallback(
    (
      fetchType: TransactionFetchType = TransactionFetchType.FETCH,
      vaultId: string
    ) => {
      if (address) {
        if (fetchType === TransactionFetchType.PROMISE) {
          return loadPositionTransactions({
            variables: {
              account: address.toLowerCase(),
              vault: vaultId,
            },
          });
        }

        return loadPositionTransactions({
          variables: {
            account: address.toLowerCase(),
            vault: vaultId,
          },
        }).then((res) => {
          res.data?.deposits && setDepositsList(res.data.deposits);
          res.data?.withdrawals && setWithdrawalsList(res.data.withdrawals);
        });
      } else {
        setDepositsList([]);
        setWithdrawalsList([]);
        return;
      }
    },
    [address, setDepositsList, setWithdrawalsList, loadPositionTransactions]
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (vaultId && !vaultLoading) {
      timeout = setTimeout(() => {
        fetchVault(vaultId);
      }, 150);
    }

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [vaultId, address, fetchVault]);

  useEffect(() => {
    if (lastTransactionBlock && vaultId && !vaultLoading) {
      fetchVault(vaultId);
    }
  }, [lastTransactionBlock]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (vault?.strategies && vault?.strategies?.length) {
      /**
       * Fetch reports for TradeFi vault only after the lock period is end.
       */
      if (isTfVaultType && activeTfPeriod < 2) {
        return;
      }
      timeout = setTimeout(() => {
        vault?.strategies.forEach((strategy: IVaultStrategy) => {
          /**
           * Clear reports and historical APRs necessary for chain switch only for non-TradeFi vaults
           */
          setReports((prev) => ({
            ...prev,
            [strategy.id]: [],
          }));
          setHistoricalApr((prev) => ({
            ...prev,
            [strategy.id]: [],
          }));
          fetchReports(strategy.id, [], [], isTfVaultType);
        });
      }, 300);
    }

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [vault?.strategies, isTfVaultType, activeTfPeriod]);

  useEffect(() => {
    if (
      !vault.id ||
      updateVaultPositionLoading ||
      vaultPositionLoading ||
      transactionsLoading ||
      fetchBalanceLoading
    ) {
      return;
    }

    if (vault.id && address) {
      fetchVaultPosition(vault.id, address).then(
        (vaultPosition: IVaultPosition) => {
          Promise.all([
            fetchPositionTransactions(TransactionFetchType.PROMISE, vault.id),
            fetchBalanceToken(vaultPosition),
          ])
            .then(([transactions, balanceToken]) => {
              setBalanceToken(balanceToken as string);
              transactions?.data?.deposits &&
                setDepositsList(transactions?.data.deposits);
              transactions?.data?.withdrawals &&
                setWithdrawalsList(transactions?.data.withdrawals);
            })
            .finally(() => {
              setVaultPosition(vaultPosition);
            });
        }
      );
    } else {
      setVaultPosition({} as IVaultPosition);
    }
  }, [
    lastTransactionBlock,
    address,
    vault.id,
    fetchPositionTransactions,
    fetchBalanceToken,
    fetchVaultPosition,
    setBalanceToken,
    setDepositsList,
    setWithdrawalsList,
    setVaultPosition,
  ]);

  const setActiveVaultInfoTabHandler = useCallback(
    (value: VaultInfoTabs) => {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, tab: value },
        },
        undefined,
        { shallow: true }
      );
    },
    [router, vaultId]
  );

  useEffect(() => {
    if (isTfVaultType && vault?.strategies && vault?.strategies?.length) {
      setTfVaultDepositEndTimeLoading(true);
      setTfVaultLockEndTimeLoading(true);

      getTfVaultPeriods(vault.strategies[0].id)
        .then((periods) => {
          const { depositPeriodEnds, lockPeriodEnds } = periods;
          setTfVaultDepositEndDate(depositPeriodEnds.toString());
          setTfVaultLockEndDate(lockPeriodEnds.toString());
        })
        .finally(() => {
          setTfVaultDepositEndTimeLoading(false);
          setTfVaultLockEndTimeLoading(false);
        });
    }
  }, [
    vault,
    isTfVaultType,
    setTfVaultDepositEndTimeLoading,
    setTfVaultLockEndTimeLoading,
  ]);

  useEffect(() => {
    if (!tfVaultDepositEndDate || !tfVaultLockEndDate) return;
    const now = dayjs();
    let activePeriod = 2;

    if (now.isBefore(dayjs.unix(Number(tfVaultLockEndDate)))) {
      activePeriod = 1;
    }

    if (now.isBefore(dayjs.unix(Number(tfVaultDepositEndDate)))) {
      activePeriod = 0;
    }

    setActiveTfPeriod(activePeriod);
  }, [tfVaultDepositEndDate, tfVaultLockEndDate, setActiveTfPeriod]);

  useEffect(() => {
    if (!tfVaultLockEndDate || !tfVaultDepositEndDate) return;

    const now = dayjs();
    const lockEndDate = dayjs.unix(Number(tfVaultLockEndDate));
    const depositEndDate = dayjs.unix(Number(tfVaultDepositEndDate));

    if (
      isTfVaultType &&
      now.isAfter(depositEndDate) &&
      now.isBefore(lockEndDate) &&
      apr &&
      BigNumber(vault?.balanceTokens).isGreaterThan(0)
    ) {
      const countOfHours = now.isBefore(lockEndDate)
        ? now.diff(depositEndDate, "hour")
        : lockEndDate.diff(depositEndDate, "hour");

      if (BigNumber(countOfHours).isGreaterThan(0)) {
        const reports: { gain: string; timestamp: string; loss: string }[] = [];

        for (let i = 0; i <= countOfHours; i++) {
          if (i % TRADE_FI_VAULT_REPORT_STEP === 0) {
            const timestamp = (
              Number(depositEndDate.add(i, "hour").unix()) * 1000
            ).toString();

            const gain = BigNumber(apr)
              .dividedBy(100)
              .multipliedBy(vault.balanceTokens)
              .dividedBy(365 * 24)
              .multipliedBy(TRADE_FI_VAULT_REPORT_STEP)
              .dividedBy(10 ** 18)
              .toString();

            reports.push({
              timestamp,
              gain: BigNumber(gain)
                .multipliedBy(10 ** 18)
                .toString(),
              loss: "0",
            });
          }
        }

        setReports((prev) => ({
          ...prev,
          [vault.strategies[0].id]: reports as IVaultStrategyReport[],
        }));
      }
      setIsReportsLoaded(true);
    }
  }, [
    isTfVaultType,
    tfVaultLockEndDate,
    tfVaultDepositEndDate,
    apr,
    vault?.balanceTokens,
    setReports,
    setIsReportsLoaded,
  ]);

  const showWithdrawAllButton = useMemo(() => {
    if (isShowWithdrawAllButtonLoading) {
      return false;
    }
    return vaultId === "2";
  }, [isShowWithdrawAllButtonLoading, vaultId]);

  const handleWithdrawAll = useCallback(async () => {
    alert("handleWithdrawAll");
  }, [vaultPosition]);

  const balanceEarned = useMemo(() => {
    if (balanceToken === "-1") return 0;
    if (transactionsLoading || fetchBalanceLoading) {
      return -1;
    }

    const sumTokenDeposits = depositsList.reduce(
      (acc: BigNumber, deposit: any) => acc.plus(deposit.tokenAmount),
      new BigNumber(0)
    );

    const sumTokenWithdrawals = withdrawalsList.reduce(
      (acc: BigNumber, withdrawal: any) => acc.plus(withdrawal.tokenAmount),
      new BigNumber(0)
    );

    return BigNumber(balanceToken || "0")
      .minus(sumTokenDeposits.minus(sumTokenWithdrawals))
      .dividedBy(10 ** vault?.token?.decimals)
      .toNumber();
  }, [
    vaultPosition,
    balanceToken,
    depositsList,
    withdrawalsList,
    transactionsLoading,
    fetchBalanceLoading,
  ]);

  return {
    vault,
    vaultAddress,
    vaultLoading,
    vaultPosition,
    vaultPositionLoading,
    reports,
    historicalApr,
    balanceEarned,
    balanceToken,
    performanceFee,
    activeVaultInfoTab,
    vaultMethods,
    strategyMethods,
    setActiveVaultInfoTab,
    managedStrategiesIds,
    isUserManager,
    updateVaultPositionLoading,
    isReportsLoaded,
    isUserKycPassed,
    isTfVaultType,
    tfVaultDepositLimit,
    tfVaultDepositEndDate,
    tfVaultLockEndDate,
    activeTfPeriod,
    minimumDeposit,
    setMinimumDeposit,
    isWithdrawAllLoading,
    handleWithdrawAll,
    tfVaultDepositEndTimeLoading,
    tfVaultLockEndTimeLoading,
    showWithdrawAllButton,
    isShowWithdrawAllButtonLoading,
    setActiveVaultInfoTabHandler,
  };
};

export default useVaultDetail;
