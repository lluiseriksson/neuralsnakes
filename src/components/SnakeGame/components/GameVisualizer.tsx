
import React from 'react';
import GameCanvas from "../GameCanvas";
import Timer from "./Timer";
import { GameState, Snake } from "../types";

interface GameVisualizerProps {
  gameState: GameState;
  startTime: number;
  isRecording: boolean;
  onSelectSnake: (snake: Snake) => void;
}

const GameVisualizer: React.FC<GameVisualizerProps> = ({
  gameState,
  startTime,
  isRecording,
  onSelectSnake
}) => {
  return (
    <div className="relative bg-gray-900 p-4 rounded-xl border-2 border-gray-700 shadow-2xl">
      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg border border-gray-600 z-10">
        <Timer startTime={startTime} />
      </div>
      
      {isRecording && (
        <div className="absolute top-2 right-2 flex items-center bg-red-900/90 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse z-10">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          REC
        </div>
      )}
      
      <div className="overflow-hidden">
        {gameState.snakes && gameState.snakes.length > 0 ? (
          <GameCanvas 
            gameState={gameState} 
            onSelectSnake={onSelectSnake}
            isRecording={isRecording} 
          />
        ) : (
          <div className="w-[600px] h-[600px] flex items-center justify-center bg-gray-900 text-white animate-pulse">
            <div className="text-center">
              <div className="inline-block mb-4 w-14 h-14 border-t-4 border-b-4 border-blue-500 border-solid rounded-full animate-spin"></div>
              <p className="text-xl font-bold">Loading game...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-gray-600 text-xs">
        <div className="flex gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Apples: {gameState.apples?.length || 0}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span>Snakes: {gameState.snakes?.filter(s => s.alive).length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameVisualizer;
