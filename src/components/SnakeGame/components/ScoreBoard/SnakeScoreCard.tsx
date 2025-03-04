
import React, { useState, useEffect } from 'react';
import { Snake } from '../../types';

interface SnakeScoreCardProps {
  snake: Snake;
  score: number;
}

const SnakeScoreCard: React.FC<SnakeScoreCardProps> = ({ snake, score }) => {
  // Use local state to ensure the score updates visually
  const [currentScore, setCurrentScore] = useState(score);
  
  // Update the local score whenever the prop changes
  useEffect(() => {
    setCurrentScore(score);
  }, [score]);

  // Also update when snake.score changes
  useEffect(() => {
    if (snake.score > currentScore) {
      setCurrentScore(snake.score);
    }
  }, [snake.score, currentScore]);

  return (
    <div className="bg-gray-900 p-3 rounded-lg flex items-center gap-3">
      <div 
        className="w-4 h-4 rounded-full flex-shrink-0" 
        style={{ backgroundColor: snake.color }} 
      />
      <div className="flex-1">
        <span className="font-medium text-white">
          Score: {currentScore} 
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Gen: {snake.brain.getGeneration()}</span>
          {!snake.alive && <span className="text-xs text-red-400">(Dead)</span>}
        </div>
      </div>
    </div>
  );
};

export default SnakeScoreCard;
