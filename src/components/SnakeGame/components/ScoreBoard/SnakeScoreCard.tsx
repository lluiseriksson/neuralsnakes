
import React, { useState, useEffect } from 'react';
import { Snake } from '../../types';
import { updateHighestScoreAchieved } from '../../hooks/snakeCreation/modelCache';

interface SnakeScoreCardProps {
  snake: Snake;
  score: number;
}

const SnakeScoreCard: React.FC<SnakeScoreCardProps> = ({ snake, score }) => {
  // Use local state to track score and ensure it updates visually
  const [currentScore, setCurrentScore] = useState(score);
  // FIXED: Get generation directly from snake object for consistency
  const [currentGeneration, setCurrentGeneration] = useState<number>(snake.generation || 0);
  
  // Update the local score whenever the props change
  useEffect(() => {
    if (typeof score === 'number' && !isNaN(score)) {
      setCurrentScore(score);
      
      // Update the snake's best score if this is higher
      if (snake.brain && typeof snake.brain.updateBestScore === 'function' && score > 0) {
        snake.brain.updateBestScore(score);
        // Also update the global highest score
        updateHighestScoreAchieved(score);
      }
    }
  }, [score, snake.brain]);

  // Update generation whenever snake prop changes
  useEffect(() => {
    // FIXED: Get generation directly from snake object for consistency
    if (typeof snake.generation === 'number' && snake.generation > 0) {
      setCurrentGeneration(snake.generation);
    }
  }, [snake]);

  // Also update score based on snake length if score is 0 but snake is longer
  useEffect(() => {
    if (snake.positions && snake.positions.length > 3 && currentScore === 0) {
      const lengthScore = snake.positions.length - 3;
      if (lengthScore > 0) {
        setCurrentScore(lengthScore);
        
        // Also update the snake's brain best score
        if (snake.brain && typeof snake.brain.updateBestScore === 'function') {
          snake.brain.updateBestScore(lengthScore);
          // Update the global highest score as well
          updateHighestScoreAchieved(lengthScore);
        }
      }
    }
  }, [snake.positions, currentScore, snake.brain]);

  // Determine a status label for the snake
  const getSnakeStatus = () => {
    if (!snake.alive) return "Dead";
    if (snake.animation?.isEating) return "Eating";
    if (snake.animation?.isDangerous) return "Danger";
    return "";
  };
  
  const snakeStatus = getSnakeStatus();

  return (
    <div className="bg-gray-900 p-3 rounded-lg flex items-center gap-3">
      <div 
        className="w-4 h-4 rounded-full flex-shrink-0" 
        style={{ backgroundColor: snake.color }} 
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="font-medium text-white">
            Score: 
          </span>
          <span className="font-medium text-white ml-1 min-w-[3ch] text-right">
            {currentScore}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Gen: {currentGeneration}</span>
          {snakeStatus && (
            <span className={`text-xs ${snakeStatus === "Dead" ? "text-red-400" : 
              snakeStatus === "Eating" ? "text-green-400" : 
              snakeStatus === "Danger" ? "text-yellow-400" : "text-gray-400"}`}>
              ({snakeStatus})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeScoreCard;
