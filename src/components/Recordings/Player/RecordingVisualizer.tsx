
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
  playbackSpeed: number;
  onTogglePlay: () => void;
  onSelectSnake: (snake: Snake) => void;
  onChangeSpeed: (speed: number) => void;
  onSeekFrame?: (frameIndex: number) => void;
}

const RecordingVisualizer: React.FC<RecordingVisualizerProps> = ({
  currentGameState,
  startTime,
  isPlaying,
  currentFrame,
  totalFrames,
  activeSnake,
  playbackSpeed,
  onTogglePlay,
  onSelectSnake,
  onChangeSpeed,
  onSeekFrame
}) => {
  if (!currentGameState) {
    return (
      <div className="p-4 text-white bg-gray-900 rounded-lg">
        <div className="flex items-center justify-center p-6">
          <div className="inline-block w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mr-3"></div>
          <span>Cargando datos de la grabación...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-4">
      <PlayerControls 
        isPlaying={isPlaying} 
        onTogglePlay={onTogglePlay}
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={onChangeSpeed}
        onSeekFrame={onSeekFrame}
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
