import React, { useState } from 'react';
import { UpgradeId } from '../game/types';
import { getUpgradeCost, computeStats } from '../game/economy';
import { useGameStore } from '../game/store';
import { UPGRADES } from '../game/upgrades';

interface UpgradeButtonProps {
  id: UpgradeId;
  locked?: boolean;
  lockReason?: string;
}

function effectDescription(id: UpgradeId, level: number): string {
  if (level === 0) return '';
  const fakeUpgrades = { volunteer: 0, binCapacity: 0, cleanupVan: 0, spawnRate: 0, rareFinds: 0 };
  fakeUpgrades[id] = level;
  const s = computeStats(fakeUpgrades);
  switch (id) {
    case 'volunteer': return `+${s.tapPower} tap power`;
    case 'binCapacity': return `×${s.coinMultiplier.toFixed(2)} coin multiplier`;
    case 'cleanupVan': return s.vanCount > 0 ? `${s.vanCount} van(s), every ${(s.vanIntervalMs/1000).toFixed(1)}s` : 'No van yet';
    case 'spawnRate': return `Spawn every ${(s.spawnIntervalMs/1000).toFixed(1)}s`;
    case 'rareFinds': return `${(s.rareChance*100).toFixed(1)}% rare ×${s.rareMultiplier}`;
    default: return '';
  }
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ id, locked, lockReason }) => {
  const upgrades = useGameStore(s => s.upgrades);
  const coins = useGameStore(s => s.coins);
  const buyUpgrade = useGameStore(s => s.buyUpgrade);
  const [pressed, setPressed] = useState(false);
  const def = UPGRADES[id];
  const level = upgrades[id];
  const isMaxed = level >= def.maxLevel;
  const cost = isMaxed ? 0 : getUpgradeCost(id, level);
  const canAfford = !isMaxed && !locked && coins >= cost;
  const pct = (level / def.maxLevel) * 100;
  const nextDesc = !isMaxed ? effectDescription(id, level + 1) : '';
  const curDesc = level > 0 ? effectDescription(id, level) : def.description;

  const handleBuy = () => {
    if (!canAfford) return;
    buyUpgrade(id);
    setPressed(true);
    setTimeout(() => setPressed(false), 200);
  };

  return (
    <div
      className={`w-full p-3 rounded-xl border transition-all ${
        locked
          ? 'bg-black/30 border-white/5 opacity-50'
          : isMaxed
          ? 'bg-yellow-500/20 border-yellow-500/40'
          : canAfford
          ? 'bg-white/5 border-white/15 hover:bg-white/10'
          : 'bg-black/20 border-white/5'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{def.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-white text-sm">{def.displayName}</span>
            <span className={`text-xs font-mono ${
              isMaxed ? 'text-yellow-400 font-bold' : 'text-white/50'
            }`}>
              {isMaxed ? 'MAX' : `${level}/${def.maxLevel}`}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isMaxed ? 'bg-yellow-400' : 'bg-blue-400'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {locked ? (
        <p className="text-xs text-white/40 mt-1">🔒 {lockReason}</p>
      ) : (
        <>
          <p className="text-xs text-white/50 mb-1">{curDesc}</p>
          {!isMaxed && nextDesc && (
            <p className="text-xs text-green-400/80">▲ {nextDesc}</p>
          )}
          {!isMaxed && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleBuy}
                disabled={!canAfford}
                style={{ transform: pressed ? 'scale(0.95)' : 'scale(1)', transition: 'transform 80ms' }}
                className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                  canAfford
                    ? 'bg-blue-500 hover:bg-blue-400 text-white'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                🪙 {cost.toLocaleString()}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UpgradeButton;