import React from 'react';
import BeachCanvas from './BeachCanvas';
import CurrencyDisplay from './CurrencyDisplay';
import UpgradePanel from './UpgradePanel';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      {/* The game canvas layer */}
      <BeachCanvas />

      {/* UI Overlays */}
      <CurrencyDisplay />
      
      {/* Upgrade button/panel would go here */}
      <UpgradePanel />

      {/* Placeholder for other UI elements */}
    </div>
  );
}

export default App;