
import React from 'react';
import { Button } from "../../ui/button";

interface GameControlsProps {
  onInitializeGame: () => void;
  isInitializing: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onInitializeGame,
  isInitializing
}) => {
  return (
    <div className="flex justify-center mt-6">
      <Button 
        onClick={onInitializeGame} 
        disabled={isInitializing}
        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg border border-indigo-400 text-lg font-bold"
      >
        {isInitializing ? 'Evolving...' : 'Start New Evolution'}
      </Button>
    </div>
  );
};

export default GameControls;
