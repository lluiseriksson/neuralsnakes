
import React from 'react';
import { Button } from "../../ui/button";
import { Link } from "react-router-dom";
import { Circle, StopCircle, Database } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  isGameRunning: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isGameRunning,
  onStartRecording,
  onStopRecording
}) => {
  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
      <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Recording Tools</h3>
      
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            onClick={onStartRecording}
            disabled={isRecording || !isGameRunning}
            variant="destructive"
            className="flex-1"
          >
            <Circle className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
          
          <Button
            onClick={onStopRecording}
            disabled={!isRecording}
            variant="outline"
            className="flex-1 border-red-900 text-red-400"
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>
        
        <Link to="/recordings" className="w-full">
          <Button className="w-full bg-purple-700 hover:bg-purple-800">
            <Database className="w-4 h-4 mr-2" />
            View Recordings
          </Button>
        </Link>
      </div>
      
      {isRecording && (
        <div className="mt-3 text-xs text-red-400 animate-pulse">
          Recording current game...
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
