
import React from 'react';
import { Button } from "../../../components/ui/button";
import { Play, Pause } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentFrame: number;
  totalFrames: number;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onTogglePlay,
  currentFrame,
  totalFrames
}) => {
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
