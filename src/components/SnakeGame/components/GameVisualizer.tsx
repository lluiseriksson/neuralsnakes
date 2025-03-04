
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
    <div className="relative bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-xl">
      <Timer startTime={startTime} />
      
      {isRecording && (
        <div className="absolute top-2 right-2 flex items-center bg-red-900/80 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse z-10">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          REC
        </div>
      )}
      
      <div className="overflow-hidden">
        {gameState.snakes && gameState.snakes.length > 0 ? (
          <GameCanvas gameState={gameState} onSelectSnake={onSelectSnake} />
        ) : (
          <div className="w-[600px] h-[600px] flex items-center justify-center bg-gray-900 text-white animate-pulse">
            <div className="text-center">
              <div className="inline-block mb-4 w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
              <p className="text-xl">Cargando juego...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameVisualizer;
