
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
        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg border border-blue-400 text-lg"
      >
        {isInitializing ? 'Initializing...' : 'New Generation'}
      </Button>
    </div>
  );
};

export default GameControls;
