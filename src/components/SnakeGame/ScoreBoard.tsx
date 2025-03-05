
import React, { useEffect, useState } from 'react';
import { Snake } from './types';
import GenerationInfoCard from './components/ScoreBoard/GenerationInfoCard';
import SnakeScoreGrid from './components/ScoreBoard/SnakeScoreGrid';
import { getCurrentHighestScore, resetHighestScore } from './hooks/snakeCreation/modelCache';

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
  
  // Reset score on mount and initialize from localStorage
  useEffect(() => {
    // First, check if we have a stored score
    const storedBestScore = getCurrentHighestScore();
    setBestScore(storedBestScore);
    
    console.log("ScoreBoard: Initialized with stored best score:", storedBestScore);
  }, []);
  
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
  
  // Listen for high score updates
  useEffect(() => {
    const handleNewHighScore = (event: CustomEvent<{ score: number }>) => {
      if (event.detail && typeof event.detail.score === 'number') {
        setBestScore(event.detail.score);
        console.log("ScoreBoard: Updated best score from event:", event.detail.score);
      }
    };
    
    window.addEventListener('new-high-score', handleNewHighScore as EventListener);
    
    return () => {
      window.removeEventListener('new-high-score', handleNewHighScore as EventListener);
    };
  }, []);
  
  // Also update best score from generationInfo props
  useEffect(() => {
    if (generationInfo && generationInfo.bestScore > bestScore) {
      setBestScore(generationInfo.bestScore);
      console.log("ScoreBoard: Updated best score from props:", generationInfo.bestScore);
    }
  }, [generationInfo, bestScore]);

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
