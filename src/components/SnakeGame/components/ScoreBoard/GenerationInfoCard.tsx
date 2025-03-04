
import React, { useEffect } from 'react';
import { resetHighestScore } from '../../hooks/snakeCreation/modelCache';

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
  // Reset high score when the component is first mounted
  useEffect(() => {
    resetHighestScore();
    console.log("High score reset on GenerationInfoCard mount");
  }, []);

  // Ensure best score is always displayed as an integer and is at least 0
  const displayScore = Math.max(0, Math.floor(bestScore));
  
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
