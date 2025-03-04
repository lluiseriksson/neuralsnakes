
import React, { useEffect, useState } from 'react';
import { Snake } from './types';
import GenerationInfoCard from './components/ScoreBoard/GenerationInfoCard';
import SnakeScoreGrid from './components/ScoreBoard/SnakeScoreGrid';

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

  return (
    <div className="mt-4 space-y-4">
      {generationInfo && (
        <GenerationInfoCard 
          generation={generationInfo.generation}
          bestScore={Math.floor(generationInfo.bestScore)}
          progress={generationInfo.progress}
        />
      )}
      
      <SnakeScoreGrid snakes={snakes} snakeScores={snakeScores} />
    </div>
  );
};

export default ScoreBoard;
