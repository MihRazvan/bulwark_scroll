import { parseUnits } from "ethers";
import { StrategyStep } from "~~/types/strategy";

/**
 * Represents the required approval amounts for each token
 */
interface RequiredApprovals {
  USDC: bigint;
  SRC: bigint;
  USDQ: bigint;
}

/**
 * Calculate the total amount of each token that needs to be approved based on the strategy steps
 * @param steps The strategy steps to analyze
 * @returns Object containing the required approval amounts for each token
 */
export const calculateRequiredApprovals = (steps: StrategyStep[]): RequiredApprovals => {
  const approvals: RequiredApprovals = {
    USDC: 0n,
    SRC: 0n,
    USDQ: 0n,
  };

  // Map of token to their decimal places
  const decimals = {
    USDC: 6,
    SRC: 18,
    USDQ: 18,
  };

  // Actions that require token approval
  const actionsRequiringApproval = {
    USDC: [1, 4, 5, 6, 9], // SUPPLY, REPAY, SWAP, ADD_LIQUIDITY, REPAY_USDQ
    SRC: [1, 4, 5, 6, 8, 9], // SUPPLY, REPAY, SWAP, ADD_LIQUIDITY, BORROW_USDQ, REPAY_USDQ
    USDQ: [5, 9, 10], // SWAP, REPAY_USDQ, PROVIDE_STABILITY
  };

  // Action codes from the original list
  const actionCodes = {
    supply: 1,
    borrow: 2,
    withdraw: 3,
    repay: 4,
    swap: 5,
    add_liquidity: 6,
    remove_liquidity: 7,
    borrow_usdq: 8,
    repay_usdq: 9,
    provide_stability: 10,
    deposit_stability_pool: 10,
    supply_stability_pool: 10,
  };

  for (const step of steps) {
    const actionCode = actionCodes[step.action];

    // For each token, check if this action requires approval
    for (const [token, actions] of Object.entries(actionsRequiringApproval)) {
      if (actions.includes(actionCode) && step.token === token) {
        // This step requires approval for this token
        const amount = parseUnits(step.amount.toString(), decimals[token as keyof typeof decimals]);
        approvals[token as keyof RequiredApprovals] += amount;
      }

      // Special case for swap action - check token_to field
      if (actionCode === 5 && step.token_to === token) {
        // For swaps, we need to approve the token we're swapping from
        if (step.amount) {
          const amount = parseUnits(step.amount.toString(), decimals[token as keyof typeof decimals]);
          approvals[token as keyof RequiredApprovals] += amount;
        }
      }

      // Special case for USDQ borrowing
      if (token === "USDQ" && actionCode === 8 && step.usdq_amount) {
        const amount = parseUnits(step.usdq_amount.toString(), 18);
        approvals.USDQ += amount;
      }
    }
  }

  return approvals;
};

/**
 * Utility function to check if any approvals are required
 * @param approvals Required approvals object
 * @returns True if any token requires approval
 */
export const isApprovalRequired = (approvals: RequiredApprovals): boolean => {
  return approvals.USDC > 0n || approvals.SRC > 0n || approvals.USDQ > 0n;
};

/**
 * Get the list of tokens that require approval
 * @param approvals Required approvals object
 * @returns Array of token names that require approval
 */
export const getTokensRequiringApproval = (approvals: RequiredApprovals): string[] => {
  const tokens: string[] = [];
  if (approvals.USDC > 0n) tokens.push("USDC");
  if (approvals.SRC > 0n) tokens.push("SRC");
  if (approvals.USDQ > 0n) tokens.push("USDQ");
  return tokens;
};
