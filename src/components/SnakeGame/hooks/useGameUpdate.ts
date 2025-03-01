
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
      console.log("Saltando actualización: isGameRunning =", isGameRunning, "isProcessing =", isProcessingUpdate.current);
      return;
    }

    isProcessingUpdate.current = true;
    console.log("Iniciando actualización del juego");

    const currentTime = Date.now();
    const timeElapsed = currentTime - startTime;
    
    if (timeElapsed >= 60000) {
      console.log("Tiempo de ronda excedido, finalizando");
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

      // Forzar movimiento de todas las serpientes vivas
      const newSnakes = prevState.snakes.map(snake => {
        if (!snake.alive) return snake;
        
        console.log(`Actualizando serpiente ${snake.id}, dirección: ${snake.direction}`);
        
        // Generate neural network inputs
        const inputs = generateNeuralNetworkInputs(snake, prevState);
        
        // Validate inputs
        if (!validateInputs(inputs)) {
          console.log(`Entradas no válidas para la serpiente ${snake.id}`, inputs);
          return snake;
        }

        // Get prediction from neural network
        const prediction = snake.brain.predict(inputs);
        console.log(`Predicción para serpiente ${snake.id}:`, prediction);
        
        // Aplicar movimiento con la predicción
        const movedSnake = moveSnake(snake, prevState, prediction);
        console.log(`Nueva posición cabeza serpiente ${snake.id}: (${movedSnake.positions[0].x}, ${movedSnake.positions[0].y})`);
        
        return movedSnake;
      });
      
      // Comprobar colisiones después de mover todas las serpientes
      const { newSnakes: snakesAfterCollisions, newApples } = checkCollisions(newSnakes, prevState.apples);
      let finalApples = ensureMinimumApples(newApples);
      let snakesToUpdate = [...snakesAfterCollisions];
      
      // Procesar colisiones con manzanas
      snakesToUpdate.forEach(snake => {
        if (!snake.alive) return;

        const head = snake.positions[0];
        const appleIndex = finalApples.findIndex(apple => 
          apple.position.x === head.x && apple.position.y === head.y
        );

        if (appleIndex !== -1) {
          console.log(`Serpiente ${snake.id} comió una manzana en (${head.x}, ${head.y})`);
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
      
      // Log state summary para depuración
      console.log(`Estado actualizado: ${snakesToUpdate.filter(s => s.alive).length} serpientes vivas, ${finalApples.length} manzanas`);
      
      return {
        ...prevState,
        snakes: snakesToUpdate,
        apples: finalApples
      };
    });
  }, [isGameRunning, startTime, endRound, ensureMinimumApples, setGameState]);

  return { updateGame };
};
