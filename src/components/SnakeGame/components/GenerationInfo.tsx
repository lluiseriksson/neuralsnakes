
import React, { useEffect, useState } from 'react';

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
  appleCount,
}) => {
  const [localAppleCount, setLocalAppleCount] = useState(appleCount);
  
  // Update apple count when props change
  useEffect(() => {
    setLocalAppleCount(appleCount);
  }, [appleCount]);
  
  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-white mb-3">AI Population Stats</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Generation</p>
          <p className="text-white text-xl font-bold" id="current-gen">{generation}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Best Score</p>
          <p className="text-white text-xl font-bold" id="best-score">{bestScore}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Snakes Alive</p>
          <p className="text-white text-xl font-bold" id="alive-count">{snakeCount}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Apples Available</p>
          <p className="text-white text-xl font-bold" id="apple-count">{localAppleCount}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Training Progress</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default GenerationInfo;
