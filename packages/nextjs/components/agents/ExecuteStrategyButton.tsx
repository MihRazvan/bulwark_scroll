"use client";

import { useEffect, useState } from "react";
import { STRATEGY_EXECUTOR_ADDRESS, TOKEN_ADDRESSES } from "~~/const";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useApprove } from "~~/hooks/useApprove";
import { useExecuteStrategy } from "~~/hooks/useExecuteStrategy";
import { Strategy } from "~~/types/strategy";
import { calculateRequiredApprovals } from "~~/utils/calculateRequiredApprovals";

interface ExecuteStrategyButtonProps {
  strategy: Strategy;
  amount: string;
  onSuccess?: (txHash: string | null) => void;
  onError?: (error: Error) => void;
}

const ExecuteStrategyButton: React.FC<ExecuteStrategyButtonProps> = ({ amount, onSuccess, onError, strategy }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<"idle" | "approving" | "executing" | "success">("idle");
  const { targetNetwork } = useTargetNetwork();
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // // Get USDC token address for current chain
  // const chainId = targetNetwork.id.toString();
  // const usdcAddress = TOKEN_ADDRESSES[chainId]?.USDC || "";

  // Hooks for approve and execute
  const {
    approveWithParsedAmountAsync,
    approveMax,
    isPending: isApprovePending,
    isSuccess: isApproveSuccess,
    isError: isApproveError,
    error: approveError,
  } = useApprove(STRATEGY_EXECUTOR_ADDRESS);

  const {
    executeStrategyAsync,
    isPending: isExecutePending,
    isSuccess: isExecuteSuccess,
    isError: isExecuteError,
    error: executeError,
  } = useExecuteStrategy(strategy);

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      setCurrentStep("approving");

      // Calculate required approvals
      const approvals = calculateRequiredApprovals(strategy.steps);
      console.log("Approvals needed:", approvals);
      let allApprovalsSuccessful = true;

      // Run approvals for each token that needs it
      if (approvals.USDC > 0n) {
        console.log("Approving USDC:", approvals.USDC.toString());
        // const usdcTx = await approveWithParsedAmountAsync(
        //   TOKEN_ADDRESSES[targetNetwork.id].USDC as `0x${string}`,
        //   approvals.USDC,
        // );
        const usdcTx = await approveMax(TOKEN_ADDRESSES[targetNetwork.id].USDC as `0x${string}`);
        console.log("USDC Approval tx hash:", usdcTx);
        if (!usdcTx) allApprovalsSuccessful = false;
      }

      if (approvals.SRC > 0n) {
        console.log("Approving SRC:", approvals.SRC.toString());
        // const srcTx = await approveWithParsedAmountAsync(
        //   TOKEN_ADDRESSES[targetNetwork.id].SRC as `0x${string}`,
        //   approvals.SRC,
        // );
        const srcTx = await approveMax(TOKEN_ADDRESSES[targetNetwork.id].SRC as `0x${string}`);
        console.log("SRC Approval tx hash:", srcTx);
        if (!srcTx) allApprovalsSuccessful = false;
      }

      if (approvals.USDQ > 0n) {
        console.log("Approving USDQ:", approvals.USDQ.toString());
        // const usdqTx = await approveWithParsedAmountAsync(
        // TOKEN_ADDRESSES[targetNetwork.id].USDQ as `0x${string}`,
        //   approvals.USDQ,
        // );
        const usdqTx = await approveMax(TOKEN_ADDRESSES[targetNetwork.id].USDQ as `0x${string}`);
        console.log("USDQ Approval tx hash:", usdqTx);
        if (!usdqTx) allApprovalsSuccessful = false;
      }

      // If all approvals were successful, execute the strategy
      if (allApprovalsSuccessful) {
        setCurrentStep("executing");
        console.log("All approvals successful, executing strategy...");
        const executeTx = await executeStrategyAsync();
        console.log("Strategy execution tx hash:", executeTx);

        if (executeTx) {
          setIsExecuting(false);
          setCurrentStep("idle");
          onSuccess?.(executeTx);
        } else {
          throw new Error("Strategy execution failed");
        }
      } else {
        throw new Error("One or more approvals failed");
      }
    } catch (e) {
      console.error("Transaction error:", e);
      setIsExecuting(false);
      setCurrentStep("idle");
      onError?.(e as Error);
    }
  };

  // Handle state changes from hooks
  useEffect(() => {
    // Handle approval errors
    if (isApproveError && approveError && currentStep === "approving") {
      setIsExecuting(false);
      setCurrentStep("idle");
      onError?.(approveError as Error);
    }

    // Handle execution errors
    if (isExecuteError && executeError && currentStep === "executing") {
      setIsExecuting(false);
      setCurrentStep("idle");
      onError?.(executeError as Error);
    }

    // Handle success
    if (isExecuteSuccess && currentStep === "executing" && !isSuccess) {
      setIsExecuting(false);
      setCurrentStep("idle");
      setIsSuccess(true);
      onSuccess?.(txHash);
    }

    // Handle success
    if (isExecuteSuccess && currentStep === "success" && !isSuccess) {
      setIsExecuting(false);
      setIsSuccess(true);
      onSuccess?.(txHash);
    }
  }, [
    isApproveSuccess,
    isApproveError,
    approveError,
    isExecuteSuccess,
    isExecuteError,
    executeError,
    currentStep,
    onSuccess,
    onError,
  ]);

  console.log("isApproveSuccess", isApproveSuccess);

  // Determine button text based on current state
  const getButtonText = () => {
    if (isExecuting) {
      if (currentStep === "approving") return "Approving...";
      if (currentStep === "executing") return "Deploying...";
      if (currentStep === "success") return "Success!";
      return "Processing...";
    }
    return "Deploy";
  };

  return (
    <button
      className="w-48 bg-[#fff9e8] text-black font-medium rounded-md p-3 hover:bg-[#fff0c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleExecute}
      disabled={isExecuting || isApprovePending || isExecutePending}
    >
      {getButtonText()}
    </button>
  );
};

export default ExecuteStrategyButton;

function approveMax(arg0: string) {
  throw new Error("Function not implemented.");
}
