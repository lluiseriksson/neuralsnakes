
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
  // Calculate a more accurate display progress percentage
  // Convert from decimal to percentage and ensure it's between 5-100%
  const displayProgress = Math.max(5, Math.min(Math.round(progress * 100), 100));
  
  // Ensure best score is a whole number for display purposes
  const displayBestScore = Math.max(0, Math.floor(bestScore));
  
  // Calculate more accurate mutation and learning rates based on generation
  const mutationRate = Math.max(5, Math.round(35 - generation/10));
  const learningRate = Math.max(5, Math.round(30 - generation/30));
  
  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
      <h3 className="text-xl font-semibold mb-3 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Population Stats</h3>
      
      <div className="flex justify-between items-center mb-2">
        <p className="text-lg">Generation: <span className="font-bold text-yellow-400">{generation}</span></p>
        <p className="text-lg">High Score: <span className="font-bold text-green-400">{displayBestScore}</span></p>
      </div>
      
      <div className="w-full bg-gray-800 h-4 mt-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300" 
          style={{ width: `${displayProgress}%` }}
        ></div>
      </div>
      
      <div className="mt-2 text-sm text-gray-300 flex justify-between">
        <span>Active: {snakeCount}</span>
        <span>Apples: {appleCount}</span>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-gray-800 p-2 rounded-lg col-span-2">
          <p className="text-sm font-medium text-gray-300">Evolution Strategy</p>
          <p className="text-xs text-gray-400">Generation advances after each game (+3 for victory)</p>
        </div>
        
        <div className="bg-gray-800 p-2 rounded-lg">
          <p className="text-sm font-medium text-gray-300">Mutation Rate</p>
          <p className="text-xs text-gray-400">Adaptive ({mutationRate}%)</p>
        </div>
        
        <div className="bg-gray-800 p-2 rounded-lg">
          <p className="text-sm font-medium text-gray-300">Learning Rate</p>
          <p className="text-xs text-gray-400">Adaptive ({learningRate}%)</p>
        </div>
      </div>
    </div>
  );
};

export default GenerationInfo;
