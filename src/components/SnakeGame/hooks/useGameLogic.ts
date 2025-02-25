
import { useState, useEffect } from 'react';
import { GameState } from '../types';
import { GRID_SIZE, APPLE_COUNT, FPS } from '../constants';
import { moveSnake } from '../utils';
import { createSnake, generateSnakeSpawnConfig } from './useSnakeCreation';
import { generateApple } from './useAppleGeneration';
import { checkCollisions } from './useCollisionDetection';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    snakes: [],
    apples: Array.from({ length: APPLE_COUNT }, generateApple),
    gridSize: GRID_SIZE,
  });

  const [victories, setVictories] = useState<{ [key: number]: number }>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  });

  const ensureMinimumApples = (apples: typeof gameState.apples) => {
    const minimumApples = 5;
    if (apples.length < minimumApples) {
      const newApples = Array.from(
        { length: minimumApples - apples.length },
        generateApple
      );
      return [...apples, ...newApples];
    }
    return apples;
  };

  const initializeGame = () => {
    const snakes = Array.from({ length: 4 }, (_, i) => {
      const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
      return createSnake(i, spawnX, spawnY, direction, color);
    });

    const apples = Array.from({ length: APPLE_COUNT }, generateApple);

    setGameState({
      snakes,
      apples,
      gridSize: GRID_SIZE,
    });
  };

  const updateGame = () => {
    setGameState(prevState => {
      // Mover las serpientes usando la red neuronal
      const newSnakes = prevState.snakes.map(snake => {
        if (!snake.alive) return snake;
        
        // Obtener inputs para la red neuronal
        const head = snake.positions[0];
        const inputs = [
          head.x / GRID_SIZE,
          head.y / GRID_SIZE,
          snake.direction === 'UP' ? 1 : 0,
          snake.direction === 'DOWN' ? 1 : 0,
          snake.direction === 'LEFT' ? 1 : 0,
          snake.direction === 'RIGHT' ? 1 : 0,
          prevState.apples.length > 0 ? prevState.apples[0].position.x / GRID_SIZE : 0,
          prevState.apples.length > 0 ? prevState.apples[0].position.y / GRID_SIZE : 0,
        ];

        // Obtener predicción de la red neuronal
        const prediction = snake.brain.predict(inputs);
        
        return moveSnake(snake, prevState, prediction);
      });
      
      // Verificar colisiones y obtener nuevas manzanas
      const { newSnakes: snakesAfterCollisions, newApples } = checkCollisions(newSnakes, prevState.apples);
      
      // Asegurar mínimo de manzanas
      let finalApples = ensureMinimumApples(newApples);
      let snakesToUpdate = [...snakesAfterCollisions];
      
      snakesToUpdate.forEach(snake => {
        if (!snake.alive) return;

        const head = snake.positions[0];
        const appleIndex = finalApples.findIndex(apple => 
          apple.position.x === head.x && apple.position.y === head.y
        );

        if (appleIndex !== -1) {
          // Comer manzana y aprender de la experiencia exitosa
          snake.score += 1;
          snake.brain.learn(true);
          snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
          finalApples.splice(appleIndex, 1);
        }

        // Verificar victoria (cambiado a 100)
        if (snake.score >= 100) {
          // Guardar el cerebro exitoso
          const successfulBrain = snake.brain.clone();
          
          setVictories(prev => ({
            ...prev,
            [snake.id]: prev[snake.id] + 1
          }));

          // Transferir el aprendizaje a la siguiente generación
          initializeGame();
          setGameState(prev => ({
            ...prev,
            snakes: prev.snakes.map(s => 
              s.id === snake.id 
                ? { ...s, brain: successfulBrain }
                : s
            )
          }));
          return;
        }
      });

      // Asegurar mínimo de manzanas nuevamente
      finalApples = ensureMinimumApples(finalApples);

      return {
        ...prevState,
        snakes: snakesToUpdate,
        apples: finalApples
      };
    });
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 1000 / FPS);
    return () => clearInterval(gameLoop);
  }, []);

  return { gameState, victories };
};
