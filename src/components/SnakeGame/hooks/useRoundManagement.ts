
import { useCallback } from 'react';
import { GameState } from '../types';
import { getModelCache, updateCurrentGeneration } from './snakeCreation/modelCache';

export const useRoundManagement = (
  gameState: GameState,
  setVictories: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>,
  setIsGameRunning: React.Dispatch<React.SetStateAction<boolean>>,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  gameLoopRef: React.MutableRefObject<NodeJS.Timeout | null>,
  initializeGame: () => void
) => {
  const endRound = useCallback(async () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    setIsGameRunning(false);
    isProcessingUpdate.current = false;

    // Find maximum score among snakes
    const maxScore = Math.max(...gameState.snakes.map(snake => snake.score));
    console.log(`Round ended. Max score: ${maxScore}`);
    
    if (maxScore > 0) {
      const winningSnakes = gameState.snakes.filter(snake => snake.score === maxScore);
      
      setVictories(prevVictories => {
        const newVictories = { ...prevVictories };
        winningSnakes.forEach(winner => {
          console.log(`Snake ${winner.id} ganó con ${winner.score} puntos! (Generación ${winner.brain.getGeneration()})`);
          newVictories[winner.id] = (prevVictories[winner.id] || 0) + 1;
        });
        return newVictories;
      });
      
      // Log current generation state
      const { currentGeneration } = getModelCache();
      console.log(`Current generation before saving: ${currentGeneration}`);
      
      // Save the winning models
      for (const winner of winningSnakes) {
        try {
          // Update the winner's best score first
          winner.brain.updateBestScore(winner.score);
          
          // Save the model to DB
          const savedId = await winner.brain.save(winner.score);
          console.log(`Saved winning model for snake ${winner.id} with score ${winner.score} (gen: ${winner.brain.getGeneration()}) - ID: ${savedId}`);
          
          // Make sure generation tracking is updated
          updateCurrentGeneration(winner.brain.getGeneration());
        } catch (saveError) {
          console.error(`Error saving winning model for snake ${winner.id}:`, saveError);
        }
      }
    }

    // Also save non-winners if they have a good score
    for (const snake of gameState.snakes) {
      // Save models with at least score 3 or more that aren't already saved as winners
      if (snake.score >= 3 && maxScore > 0 && snake.score !== maxScore) {
        try {
          snake.brain.updateBestScore(snake.score);
          
          await snake.brain.save(snake.score);
          console.log(`Saved model for snake ${snake.id} with score ${snake.score} (gen: ${snake.brain.getGeneration()})`);
          
          // Make sure generation tracking is updated
          updateCurrentGeneration(snake.brain.getGeneration());
        } catch (saveError) {
          console.error(`Error saving model for snake ${snake.id}:`, saveError);
        }
      }
    }

    // Force a delay to ensure all saves have completed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTimeout(initializeGame, 1500);
  }, [gameState.snakes, initializeGame, gameLoopRef, setIsGameRunning, isProcessingUpdate, setVictories]);

  return { endRound };
};
