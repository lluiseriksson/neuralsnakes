
import React from 'react';
import { Button } from "../../ui/button";

interface GameControlsProps {
  onInitializeGame: () => void;
  onRestartGame: () => void;
  isInitializing: boolean;
  isGameRunning: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onInitializeGame,
  onRestartGame,
  isInitializing,
  isGameRunning
}) => {
  return (
    <div className="flex gap-4 mt-6">
      <Button 
        onClick={onInitializeGame} 
        disabled={isInitializing}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg border border-blue-400"
      >
        {isInitializing ? 'Initializing...' : 'Restart Game'}
      </Button>
      
      <Button
        onClick={onRestartGame}
        disabled={isInitializing || !isGameRunning}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg border border-red-400"
      >
        End Round
      </Button>
    </div>
  );
};

export default GameControls;
