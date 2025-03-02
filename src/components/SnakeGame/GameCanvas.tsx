
import React from 'react';
import { GameState } from './types';
import { CELL_SIZE, GRID_SIZE } from './constants';
import GenerationTracker from './components/GenerationTracker';
import CanvasRenderer from './canvas/CanvasRenderer';
import LoadingOverlay from './canvas/LoadingOverlay';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasWidth = GRID_SIZE * CELL_SIZE;
  const canvasHeight = GRID_SIZE * CELL_SIZE;
  
  const hasSnakes = gameState.snakes && gameState.snakes.length > 0;

  return (
    <div className="relative">
      <CanvasRenderer 
        gameState={gameState}
        width={canvasWidth}
        height={canvasHeight}
      />
      
      {!hasSnakes && <LoadingOverlay />}
      
      {hasSnakes && (
        <GenerationTracker snakes={gameState.snakes} />
      )}
    </div>
  );
};

export default GameCanvas;
