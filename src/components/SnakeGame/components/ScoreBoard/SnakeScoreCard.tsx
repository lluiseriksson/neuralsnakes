
import React, { useState, useEffect } from 'react';
import { Snake } from '../../types';
import { updateHighestScore } from '../../hooks/snakeCreation/modelCache';

interface SnakeScoreCardProps {
  snake: Snake;
  score: number;
}

// Removed MAX_GENERATION_DISPLAY cap

const SnakeScoreCard: React.FC<SnakeScoreCardProps> = ({ snake, score }) => {
  // Use local state to track score and ensure it updates visually
  const [currentScore, setCurrentScore] = useState(score);
  const [currentGeneration, setCurrentGeneration] = useState<number>(0);
  
  // Update the local score whenever the props change
  useEffect(() => {
    if (typeof score === 'number' && !isNaN(score)) {
      setCurrentScore(score);
      
      // Update the snake's best score if this is higher
      if (snake.brain && typeof snake.brain.updateBestScore === 'function' && score > 0) {
        snake.brain.updateBestScore(score);
        // Also update the global highest score
        updateHighestScore(score);
      }
    }
  }, [score, snake.brain]);

  // Update generation whenever snake prop changes
  useEffect(() => {
    if (snake.brain && typeof snake.brain.getGeneration === 'function') {
      try {
        const generation = snake.brain.getGeneration();
        // Only update if we get a valid generation number
        if (typeof generation === 'number' && generation >= 0) {
          // No cap on generation to allow unlimited values
          setCurrentGeneration(generation);
        }
      } catch (error) {
        console.error("Error getting generation from snake brain:", error);
      }
    }
  }, [snake]);

  // Also update score based on snake length
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
        
        // Also update the snake's brain best score
        if (snake.brain && typeof snake.brain.updateBestScore === 'function' && displayScore > 0) {
          snake.brain.updateBestScore(displayScore);
          // Update the global highest score as well
          updateHighestScore(displayScore);
        }
      }
    } else if (typeof snake.score === 'number' && !isNaN(snake.score) && snake.score !== currentScore) {
      console.log(`Snake ${snake.id} score updated in UI from properties: ${currentScore} -> ${snake.score}`);
      setCurrentScore(snake.score);
      
      // Also update the snake's brain best score
      if (snake.brain && typeof snake.brain.updateBestScore === 'function' && snake.score > 0) {
        snake.brain.updateBestScore(snake.score);
        // Update the global highest score as well
        updateHighestScore(snake.score);
      }
    }
  }, [snake.positions, snake.score, currentScore, snake.id, snake.brain]);

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
