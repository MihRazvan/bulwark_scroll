"use client";

import { useEffect, useState } from "react";
import StrategyCard from "../StrategyCard";
import { useAccount } from "wagmi";
import { useBalances } from "~~/hooks/useBalances";
import strategiesData from "~~/services/example-strategies-json.json";
import { useStrategiesStore } from "~~/services/store/strategies";
import { Strategy } from "~~/types/strategy";

const selectedStrategies = [
  strategiesData.strategies[0],
  strategiesData.strategies[2],
  strategiesData.strategies[4],
] as unknown as Strategy[];

const StrategySelector: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAccount();
  const { balances, isLoading: isBalancesLoading } = useBalances();
  const strategies = useStrategiesStore(state => state.strategies);
  const generateStrategies = useStrategiesStore(state => state.generateStrategies);
  const setStrategies = useStrategiesStore(state => state.setStrategies);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        if (address) {
          setIsLoading(true);
          const success = await generateStrategies(address, {
            USDC: "1000.30",
          });
          if (!success) {
            setStrategies(selectedStrategies);
          }
        }
      } catch (error) {
        console.error("Error generating strategies:", error);
        setStrategies(selectedStrategies);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStrategies();
  }, [address]);

  // useEffect(() => {
  //   if (address) {
  //     generateStrategies(address, balances);
  //   }
  // }, [address, balances]);

  const handleExecuteStrategy = () => {
    const strategy = strategies.find(s => s.risk_level === selectedStrategy);
    if (strategy) {
      setIsExecuting(true);
      console.log("Executing strategy:", strategy);
      setTimeout(() => {
        setIsExecuting(false);
      }, 3000);
      // Reset executing state after a delay (or you could handle this in the parent component)
      setTimeout(() => setIsExecuting(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse flex-grow flex flex-col md:flex-row gap-2 items-center justify-center p-6">
        <div className="h-48 md:h-3/5 bg-neutral-800 rounded w-3/4 md:w-1/4 mb-2"></div>
        <div className="hidden md:block h-3/5 bg-neutral-800 rounded w-3/4 md:w-1/4 mb-2"></div>
        <div className="hidden md:block h-3/5 bg-neutral-800 rounded w-3/4 md:w-1/4 mb-2"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 flex-grow mt-6">
      {strategies.map((strategy, index) => {
        return (
          <div className="flex-grow flex flex-col" key={`strategy-${index}`}>
            <StrategyCard
              riskLevel={strategy.risk_level}
              steps={strategy.steps}
              apy={`${strategy.total_expected_apy.toFixed(1)}%`}
              explanation={strategy.explanation}
              onClick={() => {
                setSelectedStrategy(strategy.risk_level);
              }}
              isSelected={selectedStrategy === strategy.risk_level}
            />
            <div className="h-[80px] w-full flex justify-center items-center">
              {selectedStrategy === strategy.risk_level && (
                <button
                  className="w-48 bg-[#fff9e8] text-black font-medium rounded-md p-3 hover:bg-[#fff0c4] transition-colors"
                  onClick={handleExecuteStrategy}
                  disabled={isExecuting}
                >
                  {isExecuting ? "Executing..." : "Execute"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StrategySelector;
