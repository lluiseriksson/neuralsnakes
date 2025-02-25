
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
      // Mover las serpientes
      const newSnakes = prevState.snakes.map(snake => moveSnake(snake, prevState));
      
      // Verificar colisiones y obtener nuevas manzanas
      const { newSnakes: snakesAfterCollisions, newApples } = checkCollisions(newSnakes, prevState.apples);
      
      // Verificar colisiones con manzanas y actualizar el estado
      let finalApples = [...newApples];
      let snakesToUpdate = [...snakesAfterCollisions];
      
      snakesToUpdate.forEach(snake => {
        if (!snake.alive) return;

        const head = snake.positions[0];
        const appleIndex = finalApples.findIndex(apple => 
          apple.position.x === head.x && apple.position.y === head.y
        );

        if (appleIndex !== -1) {
          // Comer manzana
          snake.score += 1;
          snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
          finalApples.splice(appleIndex, 1);
        }

        // Verificar victoria
        if (snake.score >= 150) {
          setVictories(prev => ({
            ...prev,
            [snake.id]: prev[snake.id] + 1
          }));
          initializeGame();
          return;
        }
      });

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
