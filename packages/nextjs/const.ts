// Contract address for the Aave strategy
export const STRATEGY_ADDRESS = "0xbCfac93bbC5F93c37f3743792A372e9fe3979Ea6";

export const STRATEGY_EXECUTOR_ADDRESS = "0xc8c34998f0aE64989Cc43f3f3b657d5f050235F4";

export const TOKEN_ADDRESSES: Record<string, Record<string, `0x${string}`>> = {
  // Scroll addresses
  534352: {
    WETH: "0x5300000000000000000000000000000000000004" as `0x${string}`, // WETH on Scroll
    USDC: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4" as `0x${string}`,
    SRC: "0xd29687c813D741E2F938F4aC377128810E217b1b" as `0x${string}`,
    USDQ: "0x6F2A1A886Dbf8E36C4fa9F25a517861A930fBF3A" as `0x${string}`,
  },

  // TODO delete this
  100: {
    USDC: "0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0" as `0x${string}`,
    SRC: "0xcB444e90D8198415266c6a2724b7900fb12FC56E" as `0x${string}`,
  },
};

// Token decimals
export const TOKEN_DECIMALS: Record<string, number> = {
  USDC: 6,
  WETH: 18,
  SRC: 18,
  USDQ: 18,
};
