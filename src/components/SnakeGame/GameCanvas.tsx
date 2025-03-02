
import React, { useState, useCallback } from 'react';
import { GameState, Snake } from './types';
import { CELL_SIZE, GRID_SIZE } from './constants';
import GenerationTracker from './components/GenerationTracker';
import CanvasRenderer from './canvas/CanvasRenderer';
import LoadingOverlay from './canvas/LoadingOverlay';

interface GameCanvasProps {
  gameState: GameState;
  onSelectSnake?: (snake: Snake) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onSelectSnake }) => {
  const canvasWidth = GRID_SIZE * CELL_SIZE;
  const canvasHeight = GRID_SIZE * CELL_SIZE;
  
  const hasSnakes = gameState.snakes && gameState.snakes.length > 0;
  const [selectedSnakeId, setSelectedSnakeId] = useState<number | null>(null);

  // Handle snake selection from canvas clicks
  const handleSelectSnake = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.snakeId !== undefined) {
      const snakeId = customEvent.detail.snakeId;
      setSelectedSnakeId(snakeId);
      
      // Find the selected snake
      const selectedSnake = gameState.snakes.find(s => s.id === snakeId);
      if (selectedSnake && onSelectSnake) {
        onSelectSnake(selectedSnake);
      }
    }
  }, [gameState.snakes, onSelectSnake]);

  // Add event listener for custom selectSnake events
  React.useEffect(() => {
    document.addEventListener('selectSnake', handleSelectSnake);
    return () => {
      document.removeEventListener('selectSnake', handleSelectSnake);
    };
  }, [handleSelectSnake]);

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
      
      {selectedSnakeId !== null && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
          Snake #{selectedSnakeId} selected
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
