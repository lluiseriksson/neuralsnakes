
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
      
      // Check if time has expired (120 seconds)
      if (timeElapsed >= 120000) {
        console.log("Time limit reached in updateGame - should end round");
        isProcessingUpdate.current = false;
        
        // Dispatch timer-end event programmatically if we reach this point
        // This is a fallback in case the Timer component's event didn't work
        const timerEndEvent = new CustomEvent('timer-end', { 
          detail: { 
            timeEnded: true, 
            source: 'gameUpdate',
            timestamp: currentTime
          } 
        });
        window.dispatchEvent(timerEndEvent);
        return;
      }

      setGameState(prevState => {
        try {
          // Verify all snake scores match their position lengths
          const inconsistencies = prevState.snakes.filter(snake => 
            snake.alive && snake.positions.length > 3 && 
            Math.abs(snake.score - (snake.positions.length - 3)) > 1
          );
          
          if (inconsistencies.length > 0) {
            console.log(`Detected ${inconsistencies.length} snakes with score inconsistencies`);
            // Fix scores in place
            inconsistencies.forEach(snake => {
              const correctScore = snake.positions.length - 3;
              console.log(`Auto-correcting snake ${snake.id} score: ${snake.score} → ${correctScore} (length: ${snake.positions.length})`);
              snake.score = correctScore;
            });
          }
          
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
          
          // Log lengths and scores for debugging
          collisionResult.newSnakes.forEach(snake => {
            if (snake.alive && snake.positions.length > 3 && 
                Math.abs(snake.score - (snake.positions.length - 3)) > 1) {
              console.log(`Snake ${snake.id} has score ${snake.score} but length ${snake.positions.length} after collision processing`);
            }
          });
          
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
      isProcessingUpdate.current = false;
    }
  }, [isGameRunning, startTime, endRound, ensureMinimumApples, setGameState]);

  return { updateGame };
};
