import { AbiCoder, parseUnits } from "ethers";
import { StrategyStep } from "~~/types/strategy";

export const convertStepsToContractFormat = async (steps: StrategyStep[]): Promise<any[]> => {
  // Map protocol names to the contract's protocol identifiers
  const protocolMap: Record<string, number> = {
    AAVE: 1,
    Ambient: 2,
    Quill: 3,
  };

  // Map action names to the contract's action identifiers
  const actionMap: Record<string, number> = {
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

  // Token address mapping
  const tokenAddresses: Record<string, string> = {
    ETH: "0x5300000000000000000000000000000000000004", // WETH on Scroll
    USDC: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
    SRC: "0xd29687c813D741E2F938F4aC377128810E217b1b",
    USDQ: "0x6F2A1A886Dbf8E36C4fa9F25a517861A930fBF3A",
  };

  const abiCoder = new AbiCoder();

  return steps.map(step => {
    // Convert the step to the contract's expected format
    const contractStep = {
      protocol: protocolMap[step.protocol],
      action: actionMap[step.action],
      token: tokenAddresses[step.token],
      amount: parseUnits(step.amount.toString(), step.token === "USDC" ? 6 : 18),
      extraData: "0x",
    };

    // Handle protocol-specific extra data
    if (step.protocol === "Ambient" && step.action === "swap") {
      // For Ambient swaps, encode the token_to and minAmountOut
      const tokenTo = tokenAddresses[step.token_to || ""];
      const minAmountOut = parseUnits(
        (step.amount * 0.95).toString(), // 5% slippage
        step.token_to === "USDC" ? 6 : 18,
      );
      contractStep.extraData = abiCoder.encode(["address", "uint256"], [tokenTo, minAmountOut]);
    } else if (step.protocol === "Quill" && step.action === "borrow_usdq") {
      // For Quill borrowing, encode the USDQ amount and interest rate
      const usdqAmount = parseUnits(step.usdq_amount?.toString() || "0", 18);
      const interestRate = (step.interest_rate || 0) * 100; // Convert to basis points
      contractStep.extraData = abiCoder.encode(["uint256", "uint256"], [usdqAmount, interestRate]);
    }

    return contractStep;
  });
};
