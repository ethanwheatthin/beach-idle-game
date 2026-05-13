import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { UpgradeId } from '../game/types';
import UpgradeButton from './UpgradeButton';

const UPGRADE_ORDER: UpgradeId[] = ['volunteer', 'binCapacity', 'cleanupVan', 'spawnRate', 'rareFinds'];

const UpgradePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const upgrades = useGameStore(s => s.upgrades);
  const reset = useGameStore(s => s.reset);
  const totalTrashCleaned = useGameStore(s => s.totalTrashCleaned ?? 0);
  const cleanupVanLocked = totalTrashCleaned < 50;
  const rareFindsLocked = (upgrades.binCapacity ?? 0) < 5;

  const getLockState = (id: UpgradeId): { locked: boolean; reason?: string } => {
    if (id === 'cleanupVan' && cleanupVanLocked) {
      return { locked: true, reason: `Clean ${50 - totalTrashCleaned} more trash to unlock` };
    }
    if (id === 'rareFinds' && rareFindsLocked) {
      return { locked: true, reason: `Reach Bin Capacity level 5 to unlock` };
    }
    return { locked: false };
  };

  return (
    <div className="pointer-events-none select-none relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 text-2xl shadow-lg active:scale-95 transition-transform"
      >
        🛠️
      </button>

      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl pointer-events-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Upgrades</h2>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white text-2xl">&times;</button>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {UPGRADE_ORDER.map((id) => {
              const { locked, reason } = getLockState(id);
              return (
                <UpgradeButton
                  key={id}
                  id={id}
                  locked={locked}
                  lockReason={reason}
                />
              );
            })}
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