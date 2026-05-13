import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../game/store';

const MilestoneCelebration: React.FC = () => {
  const pendingMilestone = useGameStore(s => s.pendingMilestone);
  const dismissMilestone = useGameStore(s => s.dismissMilestone);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pendingMilestone) {
      setText(pendingMilestone.text);
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => dismissMilestone(), 400);
      }, 2000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pendingMilestone, dismissMilestone]);

  if (!pendingMilestone && !visible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
      style={{
        animation: visible ? 'milestone-bg-in 0.2s ease-out forwards' : 'milestone-bg-out 0.4s ease-in forwards',
      }}
    >
      <style>{`
        @keyframes milestone-bg-in {
          from { background: rgba(255,215,0,0); }
          to { background: rgba(255,215,0,0.15); }
        }
        @keyframes milestone-bg-out {
          from { background: rgba(255,215,0,0.15); }
          to { background: rgba(255,215,0,0); }
        }
        @keyframes milestone-text-in {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1.0); opacity: 1; }
        }
        @keyframes milestone-text-out {
          from { transform: scale(1.0); opacity: 1; }
          to   { transform: scale(0.8); opacity: 0; }
        }
      `}</style>
      <div
        className="text-center px-8 py-6 rounded-2xl"
        style={{
          animation: visible
            ? 'milestone-text-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards'
            : 'milestone-text-out 0.4s ease-in forwards',
        }}
      >
        <div className="text-5xl mb-2">🏆</div>
        <div className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg">{text}</div>
        <div className="text-white/70 text-sm mt-1">Milestone reached!</div>
      </div>
    </div>
  );
};

export default MilestoneCelebration;
