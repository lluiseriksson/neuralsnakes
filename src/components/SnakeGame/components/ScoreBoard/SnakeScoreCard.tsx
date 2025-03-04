
import React from 'react';
import { Snake } from '../../types';

interface SnakeScoreCardProps {
  snake: Snake;
  score: number;
}

const SnakeScoreCard: React.FC<SnakeScoreCardProps> = ({ snake, score }) => {
  return (
    <div className="bg-gray-900 p-3 rounded-lg flex items-center gap-3">
      <div 
        className="w-4 h-4 rounded-full flex-shrink-0" 
        style={{ backgroundColor: snake.color }} 
      />
      <div className="flex-1">
        <span className="font-medium text-white">
          Score: {score} 
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
