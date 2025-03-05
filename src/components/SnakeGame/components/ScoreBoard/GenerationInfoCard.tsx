
import React, { useEffect, useState } from 'react';
import { getCurrentHighestScore, resetHighestScore } from '../../hooks/snakeCreation/modelCache';

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
  // Local state to ensure best score always updates
  const [localBestScore, setLocalBestScore] = useState(0);
  
  // Reset high score when the component is first mounted
  useEffect(() => {
    // Get the highest score from global tracking
    const currentHighScore = getCurrentHighestScore();
    setLocalBestScore(Math.max(currentHighScore, bestScore));
    
    console.log("GenerationInfoCard: Initialized with best score:", 
      Math.max(currentHighScore, bestScore));
  }, [bestScore]);
  
  // Listen for high score updates
  useEffect(() => {
    const handleNewHighScore = (event: CustomEvent<{ score: number }>) => {
      if (event.detail && typeof event.detail.score === 'number') {
        setLocalBestScore(event.detail.score);
        console.log("GenerationInfoCard: Updated best score from event:", event.detail.score);
      }
    };
    
    window.addEventListener('new-high-score', handleNewHighScore as EventListener);
    
    return () => {
      window.removeEventListener('new-high-score', handleNewHighScore as EventListener);
    };
  }, []);
  
  // Also update when props change
  useEffect(() => {
    if (bestScore > localBestScore) {
      setLocalBestScore(bestScore);
      console.log("GenerationInfoCard: Updated best score from props:", bestScore);
    }
  }, [bestScore, localBestScore]);

  // Ensure best score is always displayed as an integer and is at least 0
  const displayScore = Math.max(0, Math.floor(localBestScore));
  
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
