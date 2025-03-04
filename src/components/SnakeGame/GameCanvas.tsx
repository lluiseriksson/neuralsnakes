
import React, { useState, useCallback } from 'react';
import { GameState, Snake } from './types';
import { CELL_SIZE, GRID_SIZE } from './constants';
import CanvasRenderer from './canvas/CanvasRenderer';
import LoadingOverlay from './canvas/LoadingOverlay';

interface GameCanvasProps {
  gameState: GameState;
  onSelectSnake?: (snake: Snake) => void;
  isRecording?: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  onSelectSnake,
  isRecording = false
}) => {
  const canvasWidth = GRID_SIZE * CELL_SIZE;
  const canvasHeight = GRID_SIZE * CELL_SIZE;
  
  const hasSnakes = gameState.snakes && gameState.snakes.length > 0;
  const [selectedSnakeId, setSelectedSnakeId] = useState<number | null>(null);

  const handleSelectSnake = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.snakeId !== undefined) {
      const snakeId = customEvent.detail.snakeId;
      setSelectedSnakeId(snakeId);
      
      const selectedSnake = gameState.snakes.find(s => s.id === snakeId);
      if (selectedSnake && onSelectSnake) {
        onSelectSnake(selectedSnake);
      }
    }
  }, [gameState.snakes, onSelectSnake]);

  React.useEffect(() => {
    document.addEventListener('selectSnake', handleSelectSnake);
    return () => {
      document.removeEventListener('selectSnake', handleSelectSnake);
    };
  }, [handleSelectSnake]);

  const selectedSnake = selectedSnakeId !== null 
    ? gameState.snakes.find(s => s.id === selectedSnakeId) 
    : null;

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-gray-600 shadow-lg bg-black">
      <CanvasRenderer 
        gameState={gameState}
        width={canvasWidth}
        height={canvasHeight}
        selectedSnakeId={selectedSnakeId}
      />
      
      {!hasSnakes && <LoadingOverlay />}
      
      {selectedSnakeId !== null && selectedSnake && (
        <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-md text-white px-4 py-3 text-sm rounded-lg border border-gray-600 shadow-lg animate-fade-in">
          <div className="font-bold text-lg text-yellow-400">Snake #{selectedSnakeId}</div>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: selectedSnake.color }}></div>
              <span className="font-semibold">Score: {selectedSnake.score}</span>
            </div>
            <div className="font-medium">Direction: {selectedSnake.direction}</div>
            <div>Apples eaten: {selectedSnake.decisionMetrics?.applesEaten || 0}</div>
            <div>Generation: {selectedSnake.brain.getGeneration() || 0}</div>
          </div>
          {selectedSnake.debugInfo?.lastDecision && (
            <div className="mt-2 p-2 bg-gray-800 bg-opacity-80 rounded border-l-2 border-green-500">
              <div className="font-semibold text-green-400">Last Decision:</div>
              <div className="flex justify-between">
                <div>{selectedSnake.debugInfo.lastDecision.reason}</div>
                {selectedSnake.debugInfo.lastDecision.confidence !== undefined && (
                  <div>Confidence: {(selectedSnake.debugInfo.lastDecision.confidence * 100).toFixed(0)}%</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
