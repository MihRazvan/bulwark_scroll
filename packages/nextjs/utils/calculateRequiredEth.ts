import { parseEther } from "viem";
import { StrategyStep } from "~~/types/strategy";

export const calculateRequiredETH = (steps: StrategyStep[]): bigint => {
  let ethRequired = 0n;

  for (const step of steps) {
    if (step.token === "ETH" && ["supply", "borrow_usdq"].includes(step.action)) {
      ethRequired = ethRequired + parseEther(step.amount.toString());
    }
  }

  // Add extra 0.01 ETH for gas buffer
  return ethRequired + parseEther("0.0001");
};
