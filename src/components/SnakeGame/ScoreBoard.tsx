
import React, { useEffect, useState } from 'react';
import { Snake } from './types';
import GenerationInfoCard from './components/ScoreBoard/GenerationInfoCard';
import SnakeScoreGrid from './components/ScoreBoard/SnakeScoreGrid';
import { getHighestScore } from './hooks/snakeCreation/modelCache';

interface ScoreBoardProps {
  snakes: Snake[];
  generationInfo?: {
    generation: number;
    bestScore: number;
    progress: number;
  };
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ snakes, generationInfo }) => {
  // Add local state for snake scores to ensure they update properly
  const [snakeScores, setSnakeScores] = useState<{[key: number]: number}>({});
  // Add local state for best score to ensure it updates properly
  const [bestScore, setBestScore] = useState(0);
  
  // Update the local scores whenever snakes array changes
  useEffect(() => {
    if (snakes && snakes.length > 0) {
      const newScores: {[key: number]: number} = {};
      snakes.forEach(snake => {
        // Ensure scores are whole numbers
        newScores[snake.id] = Math.floor(snake.score);
      });
      setSnakeScores(newScores);
    }
  }, [snakes]);
  
  // Update best score every half second
  useEffect(() => {
    const interval = setInterval(() => {
      const currentBestScore = getHighestScore();
      setBestScore(currentBestScore);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 space-y-4">
      {generationInfo && (
        <GenerationInfoCard 
          generation={generationInfo.generation}
          bestScore={Math.max(bestScore, Math.floor(generationInfo.bestScore || 0))}
          progress={generationInfo.progress}
        />
      )}
      
      <SnakeScoreGrid snakes={snakes} snakeScores={snakeScores} />
    </div>
  );
};

export default ScoreBoard;
