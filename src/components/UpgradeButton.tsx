import React from 'react';
import { UpgradeId } from '../game/types';
import { getUpgradeCost } from '../game/economy';
import { useGameStore } from '../game/store';

interface UpgradeButtonProps {
  id: UpgradeId;
  name: string;
  description: string;
  level: number;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ id, name, description }) => {
  const { upgrades, coins, buyUpgrade } = useGameStore();
  const level = upgrades[id];
  const cost = getUpgradeCost(id, level);
  const canAfford = coins >= cost;

  return (
    <button
      onClick={() => buyUpgrade(id)}
      disabled={!canAfford}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        canAfford
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
          <div className="text-xs font-bold text-yellow-400">Lv. {level}</div>
          <div className="text-sm text-white/80">🪙 {cost}</div>
        </div>
      </div>
    </button>
  );
};

export default UpgradeButton;