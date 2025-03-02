
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

  // Get the selected snake for additional info display
  const selectedSnake = selectedSnakeId !== null 
    ? gameState.snakes.find(s => s.id === selectedSnakeId) 
    : null;

  return (
    <div className="relative">
      <CanvasRenderer 
        gameState={gameState}
        width={canvasWidth}
        height={canvasHeight}
        selectedSnakeId={selectedSnakeId}
      />
      
      {!hasSnakes && <LoadingOverlay />}
      
      {hasSnakes && (
        <GenerationTracker snakes={gameState.snakes} />
      )}
      
      {selectedSnakeId !== null && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white px-3 py-2 text-sm rounded">
          <div className="font-semibold">Snake #{selectedSnakeId} selected</div>
          {selectedSnake && (
            <div className="text-xs mt-1">
              <div>Score: {selectedSnake.score}</div>
              <div>Direction: {selectedSnake.direction}</div>
              <div>Moves without eating: {selectedSnake.movesWithoutEating || 0}</div>
              {selectedSnake.debugInfo?.lastDecision && (
                <div className="text-xs mt-1 text-green-400">
                  <div>Decision: {selectedSnake.debugInfo.lastDecision.reason}</div>
                  {selectedSnake.debugInfo.lastDecision.confidence !== undefined && (
                    <div>Confidence: {selectedSnake.debugInfo.lastDecision.confidence.toFixed(2)}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
