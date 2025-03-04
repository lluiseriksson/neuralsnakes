
import React from 'react';
import { Button } from "../../../components/ui/button";
import { Slider } from "../../../components/ui/slider";
import { Play, Pause, FastForward, Rewind, SkipForward, SkipBack } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentFrame: number;
  totalFrames: number;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onSeekFrame?: (frameIndex: number) => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onTogglePlay,
  currentFrame,
  totalFrames,
  playbackSpeed = 200,
  onChangeSpeed,
  onSeekFrame
}) => {
  const handleSpeedChange = (speedMs: number) => {
    if (onChangeSpeed) {
      onChangeSpeed(speedMs);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (onSeekFrame && totalFrames > 0) {
      const frameIndex = Math.floor((value[0] / 100) * (totalFrames - 1));
      onSeekFrame(frameIndex);
    }
  };

  const calculateProgress = () => {
    if (totalFrames <= 1) return 0;
    return (currentFrame / (totalFrames - 1)) * 100;
  };

  const handleSkipBack = () => {
    if (onSeekFrame) {
      const targetFrame = Math.max(0, currentFrame - 10);
      onSeekFrame(targetFrame);
    }
  };

  const handleSkipForward = () => {
    if (onSeekFrame && totalFrames > 0) {
      const targetFrame = Math.min(totalFrames - 1, currentFrame + 10);
      onSeekFrame(targetFrame);
    }
  };

  // Convert playback speed to display format
  const getSpeedLabel = () => {
    if (playbackSpeed === 300) return "0.5x";
    if (playbackSpeed === 200) return "1x";
    if (playbackSpeed === 100) return "2x";
    if (playbackSpeed === 50) return "4x";
    return "1x";
  };

  return (
    <div className="space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Visualización de la Grabación
          {totalFrames > 0 && 
            <span className="text-sm text-gray-400 ml-2">
              (Frame {currentFrame + 1}/{totalFrames})
            </span>
          }
        </h3>
        <div className="flex gap-2">
          <div className="flex items-center mr-2 bg-gray-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSpeedChange(300)}
              className={`${playbackSpeed === 300 ? 'bg-blue-800' : ''} hover:bg-gray-700 text-white h-7 px-2`}
            >
              <Rewind className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSpeedChange(200)}
              className={`${playbackSpeed === 200 ? 'bg-blue-800' : ''} hover:bg-gray-700 text-white h-7 px-2`}
            >
              1x
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSpeedChange(100)}
              className={`${playbackSpeed === 100 ? 'bg-blue-800' : ''} hover:bg-gray-700 text-white h-7 px-2`}
            >
              <FastForward className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSpeedChange(50)}
              className={`${playbackSpeed === 50 ? 'bg-blue-800' : ''} hover:bg-gray-700 text-white h-7 px-2`}
            >
              <FastForward className="w-3 h-3 mr-1" /><FastForward className="w-3 h-3" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onTogglePlay}
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Reproducir
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Playback timeline control */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white"
          onClick={handleSkipBack}
          disabled={currentFrame <= 0}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[calculateProgress()]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSliderChange}
            disabled={totalFrames <= 1}
            className="cursor-pointer"
          />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white"
          onClick={handleSkipForward}
          disabled={currentFrame >= totalFrames - 1}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        
        <div className="text-gray-400 text-xs min-w-14 text-center">
          {getSpeedLabel()} velocidad
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
