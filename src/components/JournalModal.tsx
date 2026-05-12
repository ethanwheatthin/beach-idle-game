import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import {
  TREASURE_MANIFEST,
  TreasureCategory,
  ShellVariant,
  StarfishVariant,
  SeaweedVariant,
  DriftwoodVariant,
} from '../assets/manifest';
import { imageCache } from '../hooks/useAssetLoader';

type Tab = 'shells' | 'starfish' | 'seaweed' | 'driftwood';

interface DetailEntry {
  displayName: string;
  flavor: string;
  path: string;
  collected: boolean;
}

interface JournalModalProps {
  onClose: () => void;
}

const TAB_LABELS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'shells',    label: 'Shells',    emoji: '🐚' },
  { key: 'starfish',  label: 'Starfish',  emoji: '⭐' },
  { key: 'seaweed',   label: 'Seaweed',   emoji: '🌿' },
  { key: 'driftwood', label: 'Driftwood', emoji: '🪵' },
];

const JournalModal: React.FC<JournalModalProps> = ({ onClose }) => {
  const collection = useGameStore((s) => s.collection);
  const [activeTab, setActiveTab] = useState<Tab>('shells');
  const [detail, setDetail] = useState<DetailEntry | null>(null);

  const buildEntries = (tab: Tab): DetailEntry[] => {
    if (tab === 'shells') {
      return (Object.keys(TREASURE_MANIFEST.shells) as ShellVariant[]).map((v) => {
        const entry = TREASURE_MANIFEST.shells[v];
        return {
          displayName: entry.displayName,
          flavor: entry.flavor,
          path: entry.path,
          collected: collection.has(`shell:${v}`),
        };
      });
    }
    if (tab === 'starfish') {
      return (Object.keys(TREASURE_MANIFEST.starfish) as StarfishVariant[]).map((v) => {
        const entry = TREASURE_MANIFEST.starfish[v];
        return {
          displayName: entry.displayName,
          flavor: entry.flavor,
          path: entry.path,
          collected: collection.has(`starfish:${v}`),
        };
      });
    }
    if (tab === 'seaweed') {
      return (Object.keys(TREASURE_MANIFEST.seaweed) as SeaweedVariant[]).map((v) => {
        const entry = TREASURE_MANIFEST.seaweed[v];
        return {
          displayName: entry.displayName,
          flavor: entry.flavor,
          path: entry.path,
          collected: collection.has(`seaweed:${v}`),
        };
      });
    }
    // driftwood — use frame[0] as the display image
    return (Object.keys(TREASURE_MANIFEST.driftwood) as DriftwoodVariant[]).map((v) => {
      const entry = TREASURE_MANIFEST.driftwood[v];
      return {
        displayName: entry.displayName,
        flavor: entry.flavor,
        path: entry.frames[0],
        collected: collection.has(`driftwood:${v}`),
      };
    });
  };

  const countByTab = (tab: Tab): { found: number; total: number } => {
    const entries = buildEntries(tab);
    return { found: entries.filter((e) => e.collected).length, total: entries.length };
  };

  const entries = buildEntries(activeTab);
  const { found, total } = countByTab(activeTab);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-2 mb-2 sm:mb-0 rounded-2xl bg-[#1a3a4a] border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-white font-bold text-lg">Beach Journal</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl leading-none px-2"
            aria-label="Close journal"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-2">
          {TAB_LABELS.map(({ key, label, emoji }) => {
            const { found: f, total: t } = countByTab(key);
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setDetail(null); }}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  activeTab === key
                    ? 'text-white border-b-2 border-sky-400'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {emoji} {label}
                <div className="text-[10px] opacity-70">{f}/{t}</div>
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <div className="px-4 py-2 text-xs text-white/50">
          {found} / {total} collected
        </div>

        {/* Grid */}
        <div className="px-3 pb-4 grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
          {entries.map((entry, idx) => (
            <button
              key={idx}
              onClick={() => setDetail(entry.collected ? entry : null)}
              className={`flex flex-col items-center gap-1 p-1 rounded-lg transition-all ${
                entry.collected
                  ? 'hover:bg-white/10 cursor-pointer'
                  : 'cursor-default opacity-60'
              }`}
              title={entry.collected ? entry.displayName : '???'}
            >
              <SpriteCell path={entry.path} collected={entry.collected} size={40} />
              <span className="text-[9px] text-white/70 text-center leading-tight max-w-[48px] truncate">
                {entry.collected ? entry.displayName : '???'}
              </span>
            </button>
          ))}
        </div>

        {/* Detail pane */}
        {detail && (
          <div className="border-t border-white/10 px-4 py-3 bg-white/5 flex gap-3 items-start">
            <SpriteCell path={detail.path} collected size={48} />
            <div>
              <div className="text-white font-semibold text-sm">{detail.displayName}</div>
              <div className="text-white/60 text-xs mt-1 leading-relaxed">{detail.flavor}</div>
            </div>
            <button
              onClick={() => setDetail(null)}
              className="ml-auto text-white/40 hover:text-white text-sm"
              aria-label="Close detail"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/** Renders a sprite cell; uncollected items use CSS grayscale. */
const SpriteCell: React.FC<{ path: string; collected: boolean; size: number }> = ({
  path,
  collected,
  size,
}) => {
  const img = imageCache.get(path);

  if (!img) {
    // Sprite not loaded yet — blank placeholder
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded bg-white/10"
      />
    );
  }

  return (
    <canvas
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', filter: collected ? 'none' : 'grayscale(100%) brightness(0.4)' }}
      ref={(canvas) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, size, size);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, size, size);
      }}
    />
  );
};

export default JournalModal;
