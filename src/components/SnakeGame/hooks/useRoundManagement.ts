
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
        await winner.brain.save(winner.score);
      }
    }

    // Also save non-winners if they have a good score
    for (const snake of gameState.snakes) {
      if (snake.score > 5 && maxScore > 0 && snake.score !== maxScore) {
        await snake.brain.save(snake.score);
      }
    }

    setTimeout(initializeGame, 2000);
  }, [gameState.snakes, initializeGame, gameLoopRef, setIsGameRunning, isProcessingUpdate, setVictories]);

  return { endRound };
};
