import { useCallback } from 'react';
import { GameState } from '../types';
import { moveSnake } from '../snakeMovement';
import { checkCollisions } from './useCollisionDetection';
import { generateNeuralNetworkInputs, validateInputs } from './neuralNetworkInputs';

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
        
        // Generate neural network inputs
        const inputs = generateNeuralNetworkInputs(snake, prevState);
        
        // Validate inputs
        if (!validateInputs(inputs)) {
          console.log(`Invalid inputs for snake ${snake.id}`, inputs);
          return snake;
        }

        // Get prediction from neural network
        const prediction = snake.brain.predict(inputs);
        
        // Apply movement with prediction
        const movedSnake = moveSnake(snake, prevState, prediction);
        
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
          const reward = 2.0 + (Math.min(snake.score, 10) * 0.1); // Higher reward as score increases, but capped
          
          // Learn from the successful move using the last outputs that led to this position
          snake.brain.learn(true, inputs, snake.lastOutputs || [], reward);
          
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
          const distanceDelta = previousDistance - currentMinDistance;
          
          const inputs = generateNeuralNetworkInputs(snake, prevState);
          
          if (distanceDelta > 0) {
            // Moving toward apple - reward proportional to improvement
            const reward = 0.3 + Math.min(distanceDelta * 0.1, 0.2);
            snake.brain.learn(true, inputs, snake.lastOutputs || [], reward);
          } else if (distanceDelta === 0) {
            // Not making progress toward apple, but not moving away either
            // Very mild negative reinforcement
            const penalty = 0.1;
            snake.brain.learn(false, inputs, snake.lastOutputs || [], penalty);
          } else {
            // Moving away from apple - penalty proportional to regression
            const penalty = 0.2 + Math.min(Math.abs(distanceDelta) * 0.1, 0.3);
            snake.brain.learn(false, inputs, snake.lastOutputs || [], penalty);
          }
          
          // Bonus checks for nearby apples that were missed
          // Check if there are apples adjacent to the snake that it didn't take
          const adjacentCells = [
            { x: (head.x + 1) % snake.gridSize, y: head.y },                    // Right
            { x: (head.x - 1 + snake.gridSize) % snake.gridSize, y: head.y },   // Left
            { x: head.x, y: (head.y + 1) % snake.gridSize },                    // Down
            { x: head.x, y: (head.y - 1 + snake.gridSize) % snake.gridSize }    // Up
          ];
          
          const missedApples = finalApples.filter(apple => 
            adjacentCells.some(cell => cell.x === apple.position.x && cell.y === apple.position.y)
          );
          
          if (missedApples.length > 0) {
            // Snake missed an adjacent apple - apply stronger negative reinforcement
            const missedPenalty = 0.5; // Higher penalty for missing adjacent apples
            snake.brain.learn(false, inputs, snake.lastOutputs || [], missedPenalty);
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
