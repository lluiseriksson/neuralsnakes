
import { useCallback } from 'react';
import { GameState } from '../types';
import { moveSnake } from '../snakeMovement';
import { checkCollisions } from './useCollisionDetection';
import { generateNeuralNetworkInputs, validateInputs } from './useNeuralNetworkInputs';

export const useGameUpdate = (
  isGameRunning: boolean,
  startTime: number,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  endRound: () => void,
  ensureMinimumApples: (apples: GameState['apples']) => GameState['apples']
) => {
  const updateGame = useCallback(() => {
    if (!isGameRunning || isProcessingUpdate.current) return;

    isProcessingUpdate.current = true;

    const currentTime = Date.now();
    const timeElapsed = currentTime - startTime;
    
    if (timeElapsed >= 60000) {
      endRound();
      return;
    }

    setGameState(prevState => {
      const newSnakes = prevState.snakes.map(snake => {
        if (!snake.alive) return snake;
        
        // Generate neural network inputs
        const inputs = generateNeuralNetworkInputs(snake, prevState);
        
        // Validate inputs
        if (!validateInputs(inputs)) {
          return snake;
        }

        // Get prediction from neural network
        const prediction = snake.brain.predict(inputs);
        return moveSnake(snake, prevState, prediction);
      });
      
      const { newSnakes: snakesAfterCollisions, newApples } = checkCollisions(newSnakes, prevState.apples);
      let finalApples = ensureMinimumApples(newApples);
      let snakesToUpdate = [...snakesAfterCollisions];
      
      snakesToUpdate.forEach(snake => {
        if (!snake.alive) return;

        const head = snake.positions[0];
        const appleIndex = finalApples.findIndex(apple => 
          apple.position.x === head.x && apple.position.y === head.y
        );

        if (appleIndex !== -1) {
          snake.score += 1;
          
          // Learning with reward proportional to score (encourages longer-term strategies)
          const reward = 1 + (snake.score * 0.1); // Increasing reward for consecutive apples
          
          // Generate inputs for learning
          const inputs = generateNeuralNetworkInputs(snake, {
            ...prevState,
            apples: finalApples
          });
          
          // Now pass the inputs and empty outputs to learn
          snake.brain.learn(true, inputs, [], reward);
          
          // Ensure the snake has the correct length: 3 (initial) + score (eaten apples)
          while (snake.positions.length < 3 + snake.score) {
            snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
          }
          
          finalApples.splice(appleIndex, 1);
        }
      });

      finalApples = ensureMinimumApples(finalApples);

      isProcessingUpdate.current = false;
      return {
        ...prevState,
        snakes: snakesToUpdate,
        apples: finalApples
      };
    });
  }, [isGameRunning, startTime, endRound, ensureMinimumApples, setGameState]);

  return { updateGame };
};
