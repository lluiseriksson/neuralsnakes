
import React from 'react';
import { Snake } from '../../types';
import SnakeScoreCard from './SnakeScoreCard';

interface SnakeScoreGridProps {
  snakes: Snake[];
  snakeScores: {[key: number]: number};
}

const SnakeScoreGrid: React.FC<SnakeScoreGridProps> = ({ snakes, snakeScores }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {snakes.map(snake => (
        <SnakeScoreCard 
          key={snake.id} 
          snake={snake} 
          score={snakeScores[snake.id] || snake.score}
        />
      ))}
    </div>
  );
};

export default SnakeScoreGrid;
