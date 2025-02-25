
import React from 'react';

interface GameControlsProps {
  isRunning: boolean;
  onStartStop: () => void;
  onReset: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ isRunning, onStartStop, onReset }) => {
  return (
    <div className="flex gap-4 mb-4">
      <button
        onClick={onStartStop}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {isRunning ? 'Stop' : 'Start'}
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Reset
      </button>
    </div>
  );
};

export default GameControls;
