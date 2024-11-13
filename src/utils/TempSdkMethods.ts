import { AccountInterface } from "starknet";

export const getUserTokenBalance = async (
  publicKey: string,
  tokenMintAddress: string
) => {
  if (!tokenMintAddress || !publicKey) {
    return;
  }

  console.log("Fetching balance of token:", tokenMintAddress);
};

export const depositTokens = async (
  userPublicKey: string,
  amount: string,
  wallet: AccountInterface,
  tokenPubKey: string,
  shareTokenPubKey: string,
  vaultId: string
) => {
  if (!userPublicKey || !wallet || !vaultId) {
    return;
  }

  console.log("Depositing tokens:", amount);
};

export const withdrawTokens = async (
  userPublicKey: string,
  amount: string,
  wallet: AccountInterface,
  tokenPubKey: string,
  shareTokenPubKey: string,
  vaultId: string
) => {
  if (!userPublicKey || !wallet) {
    return;
  }

  console.log(
    "Withdrawing tokens:",
    amount,
    tokenPubKey,
    shareTokenPubKey,
    vaultId
  );
};

export const previewRedeem = async (shareBalance: string, vaultId: string) => {
  if (!shareBalance || !vaultId) {
    return;
  }
  // todo: implement preview redeem from program
  return shareBalance;
};

export const previewDeposit = async (tokenAmount: string, vaultId: string) => {
  // todo: implement preview deposit from program
  return tokenAmount;
};

export const previewWithdraw = async (tokenAmount: string, vaultId: string) => {
  // todo: implement preview withdraw from program
  return tokenAmount;
};

export const getTransactionBlock = async (signature: string) => {
  console.log("Getting transaction block:", signature);
  // try {
  //   const transaction = await connection.getTransaction(signature, {
  //     commitment: 'confirmed',
  //     maxSupportedTransactionVersion: 0,
  //   })
  //   if (!transaction) {
  //     return
  //   }
  //   return transaction.slot
  // } catch (error) {
  //   console.error('Error getting transaction block:', error)
  //   return
  // }
};

export const faucetTestToken = async (
  userPubKey: string,
  tokenPubKey: string,
  wallet: AccountInterface
) => {
  if (!userPubKey || !wallet || !tokenPubKey) {
    return;
  }
  console.log("Fauceting test token");
};

export const getTfVaultPeriods = async (strategyId: string) => {
  console.log("Fetching periods for strategy:", strategyId);
  const depositPeriodEnds = 100;
  const lockPeriodEnds = 100;

  return {
    depositPeriodEnds,
    lockPeriodEnds,
  };
};
