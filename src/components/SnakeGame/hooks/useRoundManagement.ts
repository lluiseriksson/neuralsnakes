
import { useCallback } from 'react';
import { GameState } from '../types';

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

    const maxScore = Math.max(...gameState.snakes.map(snake => snake.score));
    
    if (maxScore > 0) {
      const winningSnakes = gameState.snakes.filter(snake => snake.score === maxScore);
      
      setVictories(prevVictories => {
        const newVictories = { ...prevVictories };
        winningSnakes.forEach(winner => {
          console.log(`Snake ${winner.id} ganó con ${winner.score} puntos!`);
          newVictories[winner.id] = (prevVictories[winner.id] || 0) + 1;
        });
        return newVictories;
      });
      
      // Save the winning models
      for (const winner of winningSnakes) {
        try {
          await winner.brain.save(winner.score);
          console.log(`Saved winning model for snake ${winner.id} with score ${winner.score} (gen: ${winner.brain.getGeneration()})`);
        } catch (saveError) {
          console.error(`Error saving winning model for snake ${winner.id}:`, saveError);
        }
      }
    }

    // Also save non-winners if they have a good score
    for (const snake of gameState.snakes) {
      if (snake.score > 5 && maxScore > 0 && snake.score !== maxScore) {
        try {
          await snake.brain.save(snake.score);
          console.log(`Saved model for snake ${snake.id} with score ${snake.score} (gen: ${snake.brain.getGeneration()})`);
        } catch (saveError) {
          console.error(`Error saving model for snake ${snake.id}:`, saveError);
        }
      }
    }

    // Force a delay to ensure all saves have completed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTimeout(initializeGame, 1500);
  }, [gameState.snakes, initializeGame, gameLoopRef, setIsGameRunning, isProcessingUpdate, setVictories]);

  return { endRound };
};
