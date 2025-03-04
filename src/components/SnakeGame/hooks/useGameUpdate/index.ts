
import { useCallback } from 'react';
import { GameState } from '../../types';
import { checkCollisions } from '../../collisionDetection';
import { processSnakesMovement, hasLivingSnakes, storePreviousPositions } from './snakeProcessing';
import { calculatePreviousDistances } from './calculateDistances';
import { applyPositiveAppleLearning, applyDistanceBasedLearning, applyMissedApplePenalty } from './applyLearning';

export const useGameUpdate = (
  isGameRunning: boolean,
  startTime: number,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  endRound: () => void,
  ensureMinimumApples: (apples: GameState['apples']) => GameState['apples']
) => {
  const updateGame = useCallback(() => {
    if (!isGameRunning || isProcessingUpdate.current) {
      return;
    }

    // Set processing flag to true
    isProcessingUpdate.current = true;

    try {
      const currentTime = Date.now();
      const timeElapsed = currentTime - startTime;
      
      if (timeElapsed >= 60000) {
        console.log("Round time exceeded, ending");
        endRound();
        return;
      }

      setGameState(prevState => {
        try {
          // Check if there are living snakes
          if (!hasLivingSnakes(prevState.snakes) && prevState.snakes.length > 0) {
            console.log("No living snakes, ending round");
            setTimeout(endRound, 0);
            return prevState;
          }

          // Store previous positions for each snake to measure improvement
          const previousPositions = storePreviousPositions(prevState.snakes);
          
          // Store previous distances to closest apples
          const previousDistances = calculatePreviousDistances(prevState.snakes, prevState.apples);

          // Force movement of all living snakes
          const newSnakes = processSnakesMovement(prevState.snakes, prevState);
          
          // Check collisions after moving all snakes
          const collisionResult = checkCollisions(newSnakes, prevState.apples);
          
          // Ensure we have minimum number of apples
          let finalApples = ensureMinimumApples(collisionResult.newApples);
          
          return {
            ...prevState,
            snakes: collisionResult.newSnakes,
            apples: finalApples
          };
        } catch (error) {
          console.error("Error in game update:", error);
          return prevState; // Return unchanged state in case of error
        }
      });
    } catch (error) {
      console.error("Critical error in updateGame:", error);
    } finally {
      // Always reset the processing flag in the finally block
      // to prevent game from freezing due to unhandled exceptions
      isProcessingUpdate.current = false;
    }
  }, [isGameRunning, startTime, endRound, ensureMinimumApples, setGameState]);

  return { updateGame };
};
