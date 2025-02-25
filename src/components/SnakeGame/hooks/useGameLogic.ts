
import { useState, useEffect, useRef } from 'react';
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

  // Referencia para el tiempo de inicio de cada ronda
  const roundStartTime = useRef<number>(Date.now());

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

    // Resetear el tiempo de inicio de la ronda
    roundStartTime.current = Date.now();
  };

  const updateGame = () => {
    // Verificar si ha pasado 1 minuto
    const currentTime = Date.now();
    if (currentTime - roundStartTime.current >= 60000) { // 60000ms = 1 minuto
      console.log('1 minuto sin victoria - Reiniciando juego');
      initializeGame();
      return;
    }

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
          // Comer manzana
          snake.score += 1;
          snake.brain.learn(true);
          snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
          finalApples.splice(appleIndex, 1);
        }

        // Verificar victoria (100 puntos)
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

      // Asegurar mínimo de manzanas, pero mantener todas las existentes
      finalApples = finalApples.length < 5 ? [...finalApples, ...Array.from({ length: 5 - finalApples.length }, generateApple)] : finalApples;

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
