
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
    if (!isGameRunning || isProcessingUpdate.current) {
      return;
    }

    isProcessingUpdate.current = true;
    console.log("Starting game update");

    const currentTime = Date.now();
    const timeElapsed = currentTime - startTime;
    
    if (timeElapsed >= 60000) {
      console.log("Round time exceeded, ending");
      endRound();
      return;
    }

    setGameState(prevState => {
      // Check if there are living snakes
      const hasLivingSnakes = prevState.snakes.some(snake => snake.alive);
      
      if (!hasLivingSnakes && prevState.snakes.length > 0) {
        console.log("No living snakes, ending round");
        setTimeout(endRound, 0);
        return prevState;
      }

      // Store previous positions for each snake to measure improvement
      const previousPositions = prevState.snakes.map(snake => 
        snake.alive ? { ...snake.positions[0] } : null
      );
      
      // Store previous distances to closest apples
      const previousDistances = prevState.snakes.map(snake => {
        if (!snake.alive || !prevState.apples.length) return Infinity;
        
        const head = snake.positions[0];
        let minDistance = Infinity;
        
        for (const apple of prevState.apples) {
          const distance = Math.abs(head.x - apple.position.x) + Math.abs(head.y - apple.position.y);
          if (distance < minDistance) {
            minDistance = distance;
          }
        }
        
        return minDistance;
      });

      // Force movement of all living snakes
      const newSnakes = prevState.snakes.map(snake => {
        if (!snake.alive) return snake;
        
        console.log(`Updating snake ${snake.id}, direction: ${snake.direction}`);
        
        // Generate neural network inputs
        const inputs = generateNeuralNetworkInputs(snake, prevState);
        
        // Validate inputs
        if (!validateInputs(inputs)) {
          console.log(`Invalid inputs for snake ${snake.id}`, inputs);
          return snake;
        }

        // Get prediction from neural network
        const prediction = snake.brain.predict(inputs);
        console.log(`Prediction for snake ${snake.id}:`, prediction);
        
        // Apply movement with prediction
        const movedSnake = moveSnake(snake, prevState, prediction);
        console.log(`New head position for snake ${snake.id}: (${movedSnake.positions[0].x}, ${movedSnake.positions[0].y})`);
        
        return movedSnake;
      });
      
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
          
          // Significant positive reinforcement for eating apples
          const inputs = generateNeuralNetworkInputs(snake, prevState);
          const reward = 1.5 + (Math.min(snake.score, 10) * 0.1); // Higher reward as score increases, but capped
          
          // Learn from the successful move
          snake.brain.learn(true, inputs, [], reward);
          
          // Add a new segment to the snake
          const lastSegment = snake.positions[snake.positions.length - 1];
          snake.positions.push({ ...lastSegment });
          
          // Remove the eaten apple
          finalApples.splice(appleIndex, 1);
        } else {
          // No apple eaten - evaluate if snake is making progress
          
          // Calculate current distance to closest apple
          let currentMinDistance = Infinity;
          for (const apple of finalApples) {
            const distance = Math.abs(head.x - apple.position.x) + Math.abs(head.y - apple.position.y);
            if (distance < currentMinDistance) {
              currentMinDistance = distance;
            }
          }
          
          // Calculate if snake is moving closer to apple
          const previousDistance = previousDistances[index];
          const movingCloserToApple = currentMinDistance < previousDistance;
          
          const inputs = generateNeuralNetworkInputs(snake, prevState);
          
          if (movingCloserToApple) {
            // Small positive reward for moving toward apple
            const smallReward = 0.2;
            snake.brain.learn(true, inputs, [], smallReward);
          } else {
            // Small negative feedback for moving away from apple
            const smallPenalty = 0.1;
            snake.brain.learn(false, inputs, [], smallPenalty);
          }
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
