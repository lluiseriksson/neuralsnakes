
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
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg border border-blue-400 text-lg font-bold"
      >
        {isInitializing ? 'Initializing...' : 'New Generation'}
      </Button>
    </div>
  );
};

export default GameControls;
