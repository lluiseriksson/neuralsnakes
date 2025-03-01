
import { useCallback } from 'react';
import { GameState } from '../types';
import { moveSnake } from '../snakeMovement';
import { checkCollisions } from './useCollisionDetection';

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
        
        const head = snake.positions[0];
        
        // Find closest apple
        let closestApple = prevState.apples[0];
        let minDistance = Number.MAX_VALUE;
        
        for (const apple of prevState.apples) {
          const distance = Math.abs(head.x - apple.position.x) + Math.abs(head.y - apple.position.y);
          if (distance < minDistance) {
            minDistance = distance;
            closestApple = apple;
          }
        }
        
        // Check for obstacles in each direction
        const obstacles = [0, 0, 0, 0]; // UP, RIGHT, DOWN, LEFT
        
        // Self-collision detection (avoid its own body)
        for (let i = 1; i < snake.positions.length; i++) {
          const segment = snake.positions[i];
          
          if (head.x === segment.x && head.y - 1 === segment.y) obstacles[0] = 1; // UP
          if (head.x + 1 === segment.x && head.y === segment.y) obstacles[1] = 1; // RIGHT
          if (head.x === segment.x && head.y + 1 === segment.y) obstacles[2] = 1; // DOWN
          if (head.x - 1 === segment.x && head.y === segment.y) obstacles[3] = 1; // LEFT
        }
        
        // Create inputs for neural network - EXACT 8 INPUTS
        const inputs = [
          head.x / snake.gridSize,                    // Normalized x position
          head.y / snake.gridSize,                    // Normalized y position
          closestApple.position.x / snake.gridSize,   // Normalized apple x
          closestApple.position.y / snake.gridSize,   // Normalized apple y
          obstacles[0],                               // Obstacle UP
          obstacles[1],                               // Obstacle RIGHT
          obstacles[2],                               // Obstacle DOWN
          obstacles[3]                                // Obstacle LEFT
        ];
        
        // Ensure we have exactly 8 inputs
        if (inputs.length !== 8) {
          console.error(`Invalid input length: ${inputs.length}, expected 8`);
        }

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
          
          // The inputs used in the last prediction
          const lastInputs = [
            head.x / snake.gridSize,
            head.y / snake.gridSize,
            finalApples[appleIndex].position.x / snake.gridSize, 
            finalApples[appleIndex].position.y / snake.gridSize,
            // Add other inputs as used in the prediction above
          ];
          
          // Now pass the inputs and empty outputs to learn
          snake.brain.learn(true, lastInputs, [], reward);
          
          // Aseguramos que la serpiente tenga el tamaño correcto: 3 (inicial) + score (manzanas comidas)
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
