"use client";

import { useEffect } from "react";
import { formatEther, formatUnits } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { TOKEN_ADDRESSES, TOKEN_DECIMALS, erc20Abi, useBalancesStore } from "~~/services/store/balances";
import { TokenBalances } from "~~/types/balances";

export function useBalances() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { balances, isLoading, error, setBalances, setLoading, setError } = useBalancesStore();

  // Get ETH balance
  const {
    data: ethBalanceData,
    isLoading: isEthLoading,
    refetch: refetchEth,
  } = useBalance({
    address,
    chainId: targetNetwork.id,
  });

  // Get token addresses for current chain
  const chainId = targetNetwork.id.toString();
  const tokenAddresses = TOKEN_ADDRESSES[chainId] || {};

  // Prepare contract calls for ERC20 tokens
  const contractCalls = Object.entries(tokenAddresses).map(([token, tokenAddress]) => ({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf" as const,
    args: [address as `0x${string}`],
  }));

  // Get token balances
  const {
    data: tokenBalancesData,
    isLoading: isTokensLoading,
    refetch: refetchTokens,
  } = useReadContracts({
    contracts: contractCalls,
  });

  // Update balances in store when data changes
  useEffect(() => {
    if (address) {
      setLoading(isEthLoading || isTokensLoading);

      if (!isEthLoading && ethBalanceData && !isTokensLoading) {
        const formattedBalances: TokenBalances = {
          ETH: formatEther(ethBalanceData.value),
        };

        // Add token balances
        if (tokenBalancesData) {
          Object.keys(tokenAddresses).forEach((token, index) => {
            const balance = tokenBalancesData[index]?.result;
            if (balance) {
              formattedBalances[token] = formatUnits(balance, TOKEN_DECIMALS[token] || 18);
            } else {
              formattedBalances[token] = "0";
            }
          });
        }

        setBalances(formattedBalances);
        setError(null);
      }
    } else {
      // Reset balances when disconnected
      setBalances({});
    }
  }, [
    address,
    ethBalanceData,
    tokenBalancesData,
    isEthLoading,
    isTokensLoading,
    setBalances,
    setLoading,
    setError,
    tokenAddresses,
  ]);

  // Function to manually refresh balances
  const refreshBalances = () => {
    if (address) {
      refetchEth();
      refetchTokens();
    }
  };

  return {
    balances,
    isLoading: isLoading || isEthLoading || isTokensLoading,
    error,
    refreshBalances,
  };
}
