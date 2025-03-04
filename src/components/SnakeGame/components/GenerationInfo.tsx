
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
  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
      <div className="flex justify-between items-center mb-1">
        <p className="text-lg">Generation: <span className="font-bold text-yellow-400">{generation}</span></p>
        <p className="text-lg">Best: <span className="font-bold text-green-400">{bestScore}</span></p>
      </div>
      
      <div className="w-full bg-gray-800 h-3 mt-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        ></div>
      </div>
      
      <div className="mt-2 text-xs text-gray-300 flex justify-between">
        <span>AI Progress: {Math.round(progress * 100)}%</span>
        <span>{snakeCount} active snakes</span>
        <span>Apples: {appleCount}</span>
      </div>
    </div>
  );
};

export default GenerationInfo;
