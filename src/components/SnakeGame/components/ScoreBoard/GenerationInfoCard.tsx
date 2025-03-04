
import React from 'react';

interface GenerationInfoCardProps {
  generation: number;
  bestScore: number;
  progress: number;
}

const GenerationInfoCard: React.FC<GenerationInfoCardProps> = ({ 
  generation, 
  bestScore, 
  progress 
}) => {
  // Ensure best score is always displayed as an integer
  const displayScore = Math.round(bestScore);
  
  return (
    <div className="bg-gray-800 p-3 rounded-lg text-white">
      <h3 className="text-lg font-semibold mb-2">Current Generation: {generation}</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-gray-400 text-sm">Best Score:</span>
          <p className="font-medium">{displayScore}</p>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Progress:</span>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
            <div 
              className="bg-green-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
};

export default GenerationInfoCard;
