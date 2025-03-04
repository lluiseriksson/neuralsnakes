
import React from 'react';

const EvolutionSystem: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-700 text-white text-sm max-w-2xl shadow-lg">
      <p className="font-bold mb-2 text-purple-400">Neural Evolution System:</p>
      <div className="grid grid-cols-2 gap-4">
        <ul className="list-disc list-inside mt-1 text-xs space-y-1 text-gray-300">
          <li className="text-yellow-400">Yellow snake: optimal model (low mutation)</li>
          <li className="text-blue-400">Blue snake: combined model (medium mutation)</li>
          <li className="text-gray-400">Other snakes: experimental models (high mutation)</li>
        </ul>
        <div className="bg-gray-800 p-2 rounded text-xs">
          <p className="text-green-400 font-semibold mb-1">Information:</p>
          <p>Current generation: <span id="current-gen"></span></p>
          <p>Best score: <span id="best-score"></span></p>
          <p>Snakes alive: <span id="alive-count"></span></p>
        </div>
      </div>
    </div>
  );
};

export default EvolutionSystem;
