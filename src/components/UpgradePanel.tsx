import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { upgrades } from '../game/upgrades';
import { getUpgradeCost } from '../game/economy';
import { UpgradeId } from '../game/types';
import UpgradeButton from './UpgradeButton';

const UpgradePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { upgrades: gameUpgrades, buyUpgrade, reset } = useGameStore();

  return (
    <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 text-2xl shadow-lg active:scale-95 transition-transform"
      >
        🛠️
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-4 w-80 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Upgrades</h2>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-2xl">&times;</button>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {(Object.keys(upgrades) as UpgradeId[]).map((id) => (
              <UpgradeButton
                key={id}
                id={id}
                name={upgrades[id].name}
                description={upgrades[id].description}
                level={gameUpgrades[id]}
              />
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-center">
            <button
              onClick={reset}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Reset Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradePanel;