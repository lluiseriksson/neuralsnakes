
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
      // Verifica si hay serpientes vivas
      const hasLivingSnakes = prevState.snakes.some(snake => snake.alive);
      if (!hasLivingSnakes && prevState.snakes.length > 0) {
        console.log("No hay serpientes vivas, terminando ronda");
        setTimeout(endRound, 0);
        return prevState;
      }

      const newSnakes = prevState.snakes.map(snake => {
        if (!snake.alive) return snake;
        
        // Generate neural network inputs
        const inputs = generateNeuralNetworkInputs(snake, prevState);
        
        // Validate inputs
        if (!validateInputs(inputs)) {
          console.log(`Entradas no válidas para la serpiente ${snake.id}`, inputs);
          return snake;
        }

        // Get prediction from neural network
        const prediction = snake.brain.predict(inputs);
        const movedSnake = moveSnake(snake, prevState, prediction);
        
        return movedSnake;
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
          
          // Learning with reward proportional to score
          const reward = 1 + (snake.score * 0.1);
          
          // Generate inputs for learning
          const inputs = generateNeuralNetworkInputs(snake, {
            ...prevState,
            apples: finalApples
          });
          
          // Learn from the successful move
          snake.brain.learn(true, inputs, [], reward);
          
          // Add a new segment to the snake
          const lastSegment = snake.positions[snake.positions.length - 1];
          snake.positions.push({ ...lastSegment });
          
          // Remove the eaten apple
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
