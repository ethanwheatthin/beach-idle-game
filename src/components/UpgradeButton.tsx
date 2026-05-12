import React, { useState } from 'react';
import { UpgradeId } from '../game/types';
import { getUpgradeCost } from '../game/economy';
import { useGameStore } from '../game/store';
import { upgrades as upgradeDefs } from '../game/upgrades';

interface UpgradeButtonProps {
  id: UpgradeId;
  name: string;
  description: string;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ id, name, description }) => {
  const { upgrades, coins, buyUpgrade } = useGameStore();
  const [flash, setFlash] = useState(false);
  const level = upgrades[id];
  const maxLevel = upgradeDefs[id].maxLevel;
  const isMaxed = level >= maxLevel;
  const cost = isMaxed ? 0 : getUpgradeCost(id, level);
  const canAfford = !isMaxed && coins >= cost;

  const handleBuy = () => {
    if (!canAfford) return;
    buyUpgrade(id);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  };

  return (
    <button
      onClick={handleBuy}
      disabled={!canAfford}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isMaxed
          ? 'bg-yellow-500/20 border-yellow-500/30 opacity-70 cursor-not-allowed'
          : flash
          ? 'bg-green-500/30 border-green-400/50'
          : canAfford
          ? 'bg-white/5 border-white/10 hover:bg-white/10 active:scale-[0.98]'
          : 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-white">{name}</h3>
          <p className="text-xs text-white/60">{description}</p>
        </div>
        <div className="text-right">
          <div className={`text-xs font-bold ${isMaxed ? 'text-yellow-400' : 'text-white/60'}`}>
            {isMaxed ? 'MAX' : `Lv. ${level}`}
          </div>
          {!isMaxed && <div className="text-sm text-white/80">🪙 {cost}</div>}
        </div>
      </div>
    </button>
  );
};

export default UpgradeButton;