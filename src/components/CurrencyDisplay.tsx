import React from 'react';
import { useGameStore } from '../game/store';
import { formatNumber } from '../utils/format';

const CurrencyDisplay: React.FC = () => {
  const coins = useGameStore((state) => state.coins);

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none select-none">
      <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full inline-flex items-center gap-2 border border-white/20 animate-pulse-subtle">
        <span className="text-2xl">🪙</span>
        <span className="text-2xl font-bold text-white">
          {formatNumber(coins)}
        </span>
      </div>
    </div>
  );
};

export default CurrencyDisplay;