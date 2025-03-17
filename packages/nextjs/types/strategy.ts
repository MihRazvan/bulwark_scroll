/**
 * Represents a single step in a strategy
 */
export interface StrategyStep {
  protocol: string;
  action:
    | "supply"
    | "borrow"
    | "withdraw"
    | "repay"
    | "swap"
    | "add_liquidity"
    | "remove_liquidity"
    | "borrow_usdq"
    | "repay_usdq"
    | "provide_stability";
  token: string;
  amount: number;
  expected_apy: number;
  token_to?: string;
  usdq_amount?: number;
  interest_rate?: number;
}

/**
 * Represents a complete investment strategy
 */
export interface Strategy {
  risk_level: number;
  steps: StrategyStep[];
  explanation: string;
  total_expected_apy: number;
  risk_factors: string[];
}
