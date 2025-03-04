
import React, { useState, useEffect } from 'react';
import { Snake } from '../../types';

interface SnakeScoreCardProps {
  snake: Snake;
  score: number;
}

const SnakeScoreCard: React.FC<SnakeScoreCardProps> = ({ snake, score }) => {
  // Use local state to track score and ensure it updates visually
  const [currentScore, setCurrentScore] = useState(score);
  const [currentGeneration, setCurrentGeneration] = useState<number>(0);
  
  // Update the local score whenever the props change
  useEffect(() => {
    if (typeof score === 'number' && !isNaN(score)) {
      setCurrentScore(score);
    }
  }, [score]);

  // Update generation whenever snake prop changes
  useEffect(() => {
    if (snake.brain && typeof snake.brain.getGeneration === 'function') {
      try {
        const generation = snake.brain.getGeneration();
        // Only update if we get a valid generation number
        if (typeof generation === 'number' && generation >= 0) {
          setCurrentGeneration(generation);
        }
      } catch (error) {
        console.error("Error getting generation from snake brain:", error);
      }
    }
  }, [snake]);

  // Also update score based on snake length - this is the key fix
  useEffect(() => {
    if (snake.positions && snake.positions.length > 3) {
      const lengthScore = snake.positions.length - 3;
      // Check if the snake.score is valid and higher
      const snakeScore = typeof snake.score === 'number' && !isNaN(snake.score) ? snake.score : 0;
      
      // Use the max of length-based score or stored score
      const displayScore = Math.max(lengthScore, snakeScore);
      
      if (displayScore !== currentScore) {
        console.log(`Snake ${snake.id} score updated in UI: ${currentScore} -> ${displayScore}`);
        setCurrentScore(displayScore);
      }
    } else if (typeof snake.score === 'number' && !isNaN(snake.score) && snake.score !== currentScore) {
      console.log(`Snake ${snake.id} score updated in UI from properties: ${currentScore} -> ${snake.score}`);
      setCurrentScore(snake.score);
    }
  }, [snake.positions, snake.score, currentScore, snake.id]);

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
          <span className="text-xs text-gray-400">Gen: {currentGeneration}</span>
          {!snake.alive && <span className="text-xs text-red-400">(Dead)</span>}
        </div>
      </div>
    </div>
  );
};

export default SnakeScoreCard;
