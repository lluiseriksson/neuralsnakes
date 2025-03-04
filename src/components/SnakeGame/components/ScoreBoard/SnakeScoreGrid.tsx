
import React, { useState, useEffect } from 'react';
import { Snake } from '../../types';
import SnakeScoreCard from './SnakeScoreCard';

interface SnakeScoreGridProps {
  snakes: Snake[];
  snakeScores: {[key: number]: number};
}

const SnakeScoreGrid: React.FC<SnakeScoreGridProps> = ({ snakes, snakeScores }) => {
  // Create a local state to track scores
  const [localScores, setLocalScores] = useState<{[key: number]: number}>(snakeScores);
  
  // Update local scores when props change
  useEffect(() => {
    setLocalScores(prevScores => {
      const newScores = { ...prevScores };
      
      // Update scores from props
      Object.keys(snakeScores).forEach(key => {
        const id = parseInt(key);
        newScores[id] = snakeScores[id];
      });
      
      // Also update from snake objects directly to catch all updates
      snakes.forEach(snake => {
        if (snake.score !== undefined) {
          newScores[snake.id] = Math.max(snake.score, newScores[snake.id] || 0);
        }
      });
      
      return newScores;
    });
  }, [snakes, snakeScores]);

  // Add a polling mechanism to ensure scores are always up-to-date
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLocalScores(prevScores => {
        const newScores = { ...prevScores };
        
        // Update directly from snake objects
        snakes.forEach(snake => {
          if (snake.score !== undefined && snake.score !== newScores[snake.id]) {
            newScores[snake.id] = snake.score;
          }
        });
        
        return newScores;
      });
    }, 500); // Check every 500ms
    
    return () => clearInterval(intervalId);
  }, [snakes]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {snakes.map(snake => (
        <SnakeScoreCard 
          key={snake.id} 
          snake={snake} 
          score={localScores[snake.id] || snake.score || 0}
        />
      ))}
    </div>
  );
};

export default SnakeScoreGrid;
