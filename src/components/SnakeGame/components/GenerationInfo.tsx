
import React from 'react';

interface GenerationInfoProps {
  generation: number;
  bestScore: number;
  progress: number;
  snakeCount: number;
  appleCount: number;
}

const GenerationInfo: React.FC<GenerationInfoProps> = ({
  generation,
  bestScore,
  progress,
  snakeCount,
  appleCount
}) => {
  // Ensure progress is displayed as a percentage between 0-100
  const displayProgress = Math.min(Math.round(progress * 100), 100);
  
  // Ensure best score is a whole number for display purposes
  const displayBestScore = Math.floor(bestScore);
  
  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
      <h3 className="text-lg font-semibold mb-2 text-center">AI Population Stats</h3>
      
      <div className="flex justify-between items-center mb-1">
        <p className="text-lg">Generation: <span className="font-bold text-yellow-400">{generation}</span></p>
        <p className="text-lg">Best Score: <span className="font-bold text-green-400">{displayBestScore}</span></p>
      </div>
      
      <div className="w-full bg-gray-800 h-3 mt-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
          style={{ width: `${displayProgress}%` }}
        ></div>
      </div>
      
      <div className="mt-2 text-xs text-gray-300 flex justify-between">
        <span>AI Progress: {displayProgress}%</span>
        <span>{snakeCount} active snakes</span>
        <span>Apples: {appleCount}</span>
      </div>
      
      <div className="mt-3 bg-gray-800 p-2 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-1">Learning History</h4>
        <div className="text-xs text-center text-gray-400">
          Select a snake to view its learning history
        </div>
      </div>
    </div>
  );
};

export default GenerationInfo;
