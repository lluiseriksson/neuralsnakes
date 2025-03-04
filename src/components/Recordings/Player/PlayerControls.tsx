
import React from 'react';
import { Button } from "../../../components/ui/button";
import { Play, Pause, FastForward, Rewind } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentFrame: number;
  totalFrames: number;
  playbackSpeed?: number;
  onChangeSpeed?: (speed: number) => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onTogglePlay,
  currentFrame,
  totalFrames,
  playbackSpeed = 200,
  onChangeSpeed
}) => {
  const handleSpeedChange = (speedMs: number) => {
    if (onChangeSpeed) {
      onChangeSpeed(speedMs);
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-white">
        Recording Visualization 
        {totalFrames > 0 && 
          <span className="text-sm text-gray-400 ml-2">
            (Frame {currentFrame + 1}/{totalFrames})
          </span>
        }
      </h3>
      <div className="flex gap-2">
        {onChangeSpeed && (
          <div className="flex items-center mr-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSpeedChange(300)}
              className={`border-gray-700 ${playbackSpeed === 300 ? 'bg-blue-800' : 'bg-gray-800'} hover:bg-gray-700 text-white px-2`}
            >
              <Rewind className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSpeedChange(200)}
              className={`border-gray-700 ${playbackSpeed === 200 ? 'bg-blue-800' : 'bg-gray-800'} hover:bg-gray-700 text-white px-2`}
            >
              1x
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSpeedChange(100)}
              className={`border-gray-700 ${playbackSpeed === 100 ? 'bg-blue-800' : 'bg-gray-800'} hover:bg-gray-700 text-white px-2`}
            >
              <FastForward className="w-3 h-3" />
            </Button>
          </div>
        )}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onTogglePlay}
          className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1" />
              Play
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PlayerControls;
