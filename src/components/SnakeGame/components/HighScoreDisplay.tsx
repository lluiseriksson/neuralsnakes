
import React, { useState, useEffect } from 'react';
import { getCurrentHighestScore } from '../hooks/snakeCreation/modelCache/scoreTracking';

const HighScoreDisplay: React.FC = () => {
  const [highScore, setHighScore] = useState<number>(getCurrentHighestScore());

  useEffect(() => {
    // Initialize from current value
    setHighScore(getCurrentHighestScore());
    
    // Listen for high score updates
    const handleHighScoreUpdate = (event: CustomEvent<{ score: number }>) => {
      if (event.detail && typeof event.detail.score === 'number') {
        setHighScore(event.detail.score);
      }
    };

    // Add event listener
    window.addEventListener('new-high-score', handleHighScoreUpdate as EventListener);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('new-high-score', handleHighScoreUpdate as EventListener);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-bold py-2 px-4 rounded-md shadow-lg flex items-center space-x-2">
      <span className="text-xs sm:text-sm uppercase tracking-wider">Session High Score:</span>
      <span className="text-lg sm:text-xl">{highScore}</span>
    </div>
  );
};

export default HighScoreDisplay;
