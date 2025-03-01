
import { useCallback } from 'react';
import { GameState } from '../types';
import { moveSnake, wouldCollide } from '../snakeMovement';
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
      console.log("Skipping update: isGameRunning =", isGameRunning, "isProcessing =", isProcessingUpdate.current);
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
      
      // Process collisions with apples
      snakesToUpdate.forEach(snake => {
        if (!snake.alive) return;

        const head = snake.positions[0];
        const appleIndex = finalApples.findIndex(apple => 
          apple.position.x === head.x && apple.position.y === head.y
        );

        if (appleIndex !== -1) {
          console.log(`Snake ${snake.id} ate an apple at (${head.x}, ${head.y})`);
          snake.score += 1;
          
          // Learning with reward proportional to score
          // Increased reward to reinforce apple-eating behavior
          const reward = 1.5 + (snake.score * 0.15);
          
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
        } else {
          // Penalize slightly for not finding apples
          // This encourages exploration toward apples
          const inputs = generateNeuralNetworkInputs(snake, prevState);
          const smallPenalty = 0.05;
          snake.brain.learn(false, inputs, [], smallPenalty);
        }
        
        // Extra learning for avoiding suicide
        // If snake made a move that didn't kill it, give a small reward
        if (snake.alive) {
          const verySmallReward = 0.01;
          snake.brain.learn(true, [], [], verySmallReward);
        }
      });

      finalApples = ensureMinimumApples(finalApples);

      isProcessingUpdate.current = false;
      
      // Log state summary for debugging
      console.log(`Updated state: ${snakesToUpdate.filter(s => s.alive).length} living snakes, ${finalApples.length} apples`);
      
      return {
        ...prevState,
        snakes: snakesToUpdate,
        apples: finalApples
      };
    });
  }, [isGameRunning, startTime, endRound, ensureMinimumApples, setGameState]);

  return { updateGame };
};
