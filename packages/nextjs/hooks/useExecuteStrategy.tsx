"use client";

// import { parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
// import aaveStrategyAbi from "~~/abi/aave_strategy.json";
import strategyExecutorAbi from "~~/abi/strategy_executor.json";
import { STRATEGY_EXECUTOR_ADDRESS } from "~~/const";
import { Strategy } from "~~/types/strategy";
import { calculateRequiredETH } from "~~/utils/calculateRequiredEth";
import { convertStepsToContractFormat } from "~~/utils/convertStepsToContractFormat";

/**
 * Hook to execute simple strategy
 * @param amount Amount in USDC (as a string, e.g. "1000" for 1000 USDC)
 * @returns Object containing write function, status, and error information
 */
export const useExecuteStrategy = (strategy: Strategy) => {
  const { address } = useAccount();
  const { writeContractAsync, isPending, isSuccess, isError, error, data } = useWriteContract();

  console.log(strategy);

  // Convert amount to the correct format (USDC has 6 decimals)
  // const parsedAmount = parseUnits(amount || "0", 6);

  const executeStrategyAsync = async () => {
    if (!address) return;

    const steps = await convertStepsToContractFormat(strategy.steps);
    console.log("steps", steps);
    const ethRequired = calculateRequiredETH(strategy.steps);

    // return writeContractAsync({
    //   address: STRATEGY_ADDRESS,
    //   abi: aaveStrategyAbi,
    //   functionName: "executeSimpleStrategy",
    //   args: [parsedAmount],
    // });
    return writeContractAsync({
      address: STRATEGY_EXECUTOR_ADDRESS,
      abi: strategyExecutorAbi,
      functionName: "executeStrategy",
      args: [steps],
      value: ethRequired, // Add ETH value
      gas: 3000000n,
    });
  };

  return {
    // executeStrategy,
    executeStrategyAsync,
    isPending,
    isSuccess,
    isError,
    error,
    txData: data,
  };
};
