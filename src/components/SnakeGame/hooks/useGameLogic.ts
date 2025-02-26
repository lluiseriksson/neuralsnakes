
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

  const [startTime, setStartTime] = useState(Date.now());
  const gameEndingRef = useRef(false);

  const ensureMinimumApples = (apples: typeof gameState.apples) => {
    const minimumApples = 5;
    const maximumApples = 10; // Añadimos un límite máximo
    
    if (apples.length < minimumApples) {
      const newApples = Array.from(
        { length: minimumApples - apples.length },
        generateApple
      );
      return [...apples, ...newApples];
    }
    
    // Si hay demasiadas manzanas, reducir al máximo
    if (apples.length > maximumApples) {
      return apples.slice(0, maximumApples);
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

    setStartTime(Date.now());
    gameEndingRef.current = false;
  };

  const updateGame = () => {
    const currentTime = Date.now();
    
    // Verificar si ha pasado 1 minuto
    if (currentTime - startTime >= 60000 && !gameEndingRef.current) { // 60000ms = 1 minuto
      gameEndingRef.current = true; // Marcar que estamos terminando la ronda
      
      setGameState(prevState => {
        // Encontrar el score más alto
        const maxScore = Math.max(...prevState.snakes.map(snake => snake.score));
        
        // Encontrar todas las serpientes con el score máximo
        const winners = prevState.snakes.filter(snake => snake.score === maxScore);
        
        // Actualizar victorias para todas las serpientes ganadoras
        winners.forEach(winner => {
          setVictories(prev => ({
            ...prev,
            [winner.id]: prev[winner.id] + 1
          }));
          console.log(`Serpiente ${winner.id} ganó con ${winner.score} puntos`);
        });

        // Inicializar nueva ronda
        const newSnakes = Array.from({ length: 4 }, (_, i) => {
          const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
          return createSnake(i, spawnX, spawnY, direction, color);
        });

        const newApples = Array.from({ length: APPLE_COUNT }, generateApple);
        
        // Resetear el tiempo para la nueva ronda
        setTimeout(() => {
          setStartTime(Date.now());
          gameEndingRef.current = false;
        }, 100);

        return {
          snakes: newSnakes,
          apples: newApples,
          gridSize: GRID_SIZE,
        };
      });
      
      return;
    }

    if (!gameEndingRef.current) {
      setGameState(prevState => {
        // Mover las serpientes usando la red neuronal
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
        
        snakesAfterCollisions.forEach(snake => {
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
          snakes: snakesAfterCollisions,
          apples: finalApples
        };
      });
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 1000 / FPS);
    return () => clearInterval(gameLoop);
  }, []);

  return { gameState, victories, startTime };
};
