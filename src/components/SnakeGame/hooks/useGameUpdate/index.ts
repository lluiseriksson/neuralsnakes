
import { useCallback } from 'react';
import { GameState } from '../../types';
import { checkCollisions } from '../useCollisionDetection';
import { processSnakesMovement, hasLivingSnakes, storePreviousPositions } from './snakeProcessing';
import { calculatePreviousDistances, calculateDistanceToClosestApple } from './calculateDistances';
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
          const { newSnakes: snakesAfterCollisions, newApples } = checkCollisions(newSnakes, prevState.apples);
          let finalApples = ensureMinimumApples(newApples);
          let snakesToUpdate = [...snakesAfterCollisions];
          
          // Process learning for each snake
          snakesToUpdate.forEach((snake, index) => {
            if (!snake.alive) return;

            const head = snake.positions[0];
            
            // Check if snake ate an apple
            const appleIndex = finalApples.findIndex(apple => 
              apple.position.x === head.x && apple.position.y === head.y
            );

            if (appleIndex !== -1) {
              console.log(`Snake ${snake.id} ate an apple at (${head.x}, ${head.y})`);
              snake.score += 1;
              
              // Apply positive reinforcement for eating an apple
              applyPositiveAppleLearning(snake, prevState);
              
              // Add a new segment to the snake
              const lastSegment = snake.positions[snake.positions.length - 1];
              snake.positions.push({ ...lastSegment });
              
              // Remove the eaten apple
              finalApples.splice(appleIndex, 1);
            } else {
              // No apple eaten - evaluate if snake is making progress
              
              // Calculate current distance to closest apple
              const currentMinDistance = calculateDistanceToClosestApple(head, finalApples);
              
              // Apply learning based on whether the snake is moving closer to an apple
              applyDistanceBasedLearning(snake, prevState, previousDistances[index], currentMinDistance);
              
              // Check for missed adjacent apples
              applyMissedApplePenalty(snake, prevState, finalApples);
            }
          });

          finalApples = ensureMinimumApples(finalApples);
          
          return {
            ...prevState,
            snakes: snakesToUpdate,
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
