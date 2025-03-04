
import React from 'react';
import { GameState, Snake } from "../../../components/SnakeGame/types";
import GameVisualizer from "../../../components/SnakeGame/components/GameVisualizer";
import SnakeVisualizer from "../../../components/SnakeGame/components/SnakeVisualizer";
import PlayerControls from "./PlayerControls";

interface RecordingVisualizerProps {
  currentGameState: GameState | null;
  startTime: number;
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  activeSnake: Snake | null;
  onTogglePlay: () => void;
  onSelectSnake: (snake: Snake) => void;
}

const RecordingVisualizer: React.FC<RecordingVisualizerProps> = ({
  currentGameState,
  startTime,
  isPlaying,
  currentFrame,
  totalFrames,
  activeSnake,
  onTogglePlay,
  onSelectSnake
}) => {
  if (!currentGameState) return null;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
      <PlayerControls 
        isPlaying={isPlaying} 
        onTogglePlay={onTogglePlay}
        currentFrame={currentFrame}
        totalFrames={totalFrames}
      />
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <GameVisualizer 
            gameState={currentGameState} 
            startTime={startTime}
            isRecording={false}
            onSelectSnake={onSelectSnake}
          />
        </div>
        <div className="md:col-span-1">
          <SnakeVisualizer 
            snakes={currentGameState.snakes} 
            activeSnake={activeSnake}
            onSelectSnake={onSelectSnake}
          />
        </div>
      </div>
    </div>
  );
};

export default RecordingVisualizer;
