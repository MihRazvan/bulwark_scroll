"use client";

import { parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import erc20Abi from "~~/abi/erc20.json";

// Maximum uint256 value for "infinite" approval
const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

/**
 * Hook to approve ERC20 token spending
 * @param spenderAddress Address to approve for spending
 * @returns Object containing approve functions and status information
 */
export const useApprove = (spenderAddress: string) => {
  const { address } = useAccount();
  const { writeContract, writeContractAsync, isPending, isSuccess, isError, error, data } = useWriteContract();

  /**
   * Approve token spending
   * @param tokenAddress Token contract address
   * @param amount Amount to approve as string
   * @param decimals Token decimals (defaults to 6 for USDC)
   */
  const approve = (tokenAddress: string, amount: string, decimals = 6) => {
    if (!address || !tokenAddress || !spenderAddress || !amount || parseFloat(amount) <= 0) return;

    const parsedAmount = parseUnits(amount || "0", decimals);

    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [spenderAddress as `0x${string}`, parsedAmount],
    });
  };

  /**
   * Approve token spending (async version)
   * @param tokenAddress Token contract address
   * @param amount Amount to approve as string
   * @param decimals Token decimals (defaults to 6 for USDC)
   * @returns Promise with transaction result
   */
  const approveAsync = async (tokenAddress: string, amount: string, decimals = 6) => {
    if (!address || !tokenAddress || !spenderAddress || !amount || parseFloat(amount) <= 0) return;

    const parsedAmount = parseUnits(amount || "0", decimals);

    return writeContractAsync({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [spenderAddress as `0x${string}`, parsedAmount],
    });
  };

  /**
   * Approve token spending with bigint amount
   * @param tokenAddress Token contract address
   * @param parsedAmount Amount as bigint (already parsed with correct decimals)
   * @returns Promise with transaction result
   */
  const approveWithParsedAmountAsync = async (tokenAddress: string, parsedAmount: bigint) => {
    if (!address || !tokenAddress || !spenderAddress || parsedAmount <= 0n) return;

    return writeContractAsync({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [spenderAddress as `0x${string}`, parsedAmount],
    });
  };

  /**
   * Approve maximum possible amount (infinite approval)
   * @param tokenAddress Token contract address
   * @returns Promise with transaction result
   */
  const approveMax = async (tokenAddress: string) => {
    if (!address || !tokenAddress || !spenderAddress) return;

    return writeContractAsync({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [spenderAddress as `0x${string}`, MAX_UINT256],
    });
  };

  return {
    approve,
    approveAsync,
    approveWithParsedAmountAsync,
    approveMax,
    isPending,
    isSuccess,
    isError,
    error,
    txData: data,
  };
};
