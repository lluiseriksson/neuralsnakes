
import { useState, useEffect, useCallback } from 'react';
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

  const [startTime, setStartTime] = useState(Date.now());
  const [isGameRunning, setIsGameRunning] = useState(true);

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

  const initializeGame = useCallback(() => {
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

    setStartTime(Date.now());
    setIsGameRunning(true);
  }, []);

  const endRound = useCallback(() => {
    // Detener el juego inmediatamente
    setIsGameRunning(false);

    // Usar una promesa para asegurar el orden de las operaciones
    Promise.resolve().then(() => {
      // Obtener el puntaje más alto entre todas las serpientes
      const maxScore = Math.max(...gameState.snakes.map(snake => snake.score));
      
      if (maxScore > 0) {
        // Encontrar todas las serpientes con el puntaje máximo
        const winners = gameState.snakes.filter(snake => snake.score === maxScore);
        
        setVictories(prevVictories => {
          const newVictories = { ...prevVictories };
          winners.forEach(winner => {
            console.log(`Snake ${winner.id} ganó con ${winner.score} puntos!`);
            newVictories[winner.id] = (prevVictories[winner.id] || 0) + 1;
          });
          return newVictories;
        });
      }

      // Asegurar que el reinicio ocurra después de procesar las victorias
      setTimeout(initializeGame, 2000);
    });
  }, [gameState.snakes, initializeGame]);

  const updateGame = useCallback(() => {
    if (!isGameRunning) return;

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
          snake.brain.learn(true);
          snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
          finalApples.splice(appleIndex, 1);
        }
      });

      finalApples = ensureMinimumApples(finalApples);

      return {
        ...prevState,
        snakes: snakesToUpdate,
        apples: finalApples
      };
    });
  }, [isGameRunning, startTime, endRound]);

  // Inicializar el juego cuando el componente se monta
  useEffect(() => {
    initializeGame();
    return () => {
      setIsGameRunning(false);
    };
  }, [initializeGame]);

  // Manejar el bucle del juego
  useEffect(() => {
    if (!isGameRunning) return;
    
    const gameLoop = setInterval(updateGame, 1000 / FPS);
    return () => clearInterval(gameLoop);
  }, [isGameRunning, updateGame]);

  return { gameState, victories, startTime };
};
