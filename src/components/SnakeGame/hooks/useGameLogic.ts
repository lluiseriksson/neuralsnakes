
import { useState, useEffect } from 'react';
import { GameState, Direction, Snake } from '../types';
import { NeuralNetwork } from '../NeuralNetwork';
import { GRID_SIZE, APPLE_COUNT, FPS } from '../constants';
import { generateInitialSnake, moveSnake } from '../utils';

export const createSnake = (id: number, x: number, y: number, direction: Direction, color: string) => ({
  id,
  positions: generateInitialSnake(x, y),
  direction,
  color,
  score: 0,
  brain: new NeuralNetwork(8, 12, 4),
  alive: true
});

export const generateApple = () => ({
  position: {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  },
});

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    snakes: [],
    apples: Array.from({ length: APPLE_COUNT }, generateApple), // Inicializar manzanas desde el estado inicial
    gridSize: GRID_SIZE,
  });

  const [victories, setVictories] = useState<{ [key: number]: number }>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  });

  const initializeGame = () => {
    const snakes = [
      createSnake(0, 5, 5, 'RIGHT', 'yellow'),
      createSnake(1, 25, 25, 'LEFT', 'blue'),
      createSnake(2, 5, 25, 'UP', 'green'),
      createSnake(3, 25, 5, 'DOWN', 'red')
    ];

    const apples = Array.from({ length: APPLE_COUNT }, generateApple);

    setGameState({
      snakes,
      apples,
      gridSize: GRID_SIZE,
    });
  };

  const checkCollisions = (snakes: Snake[], currentApples: typeof gameState.apples) => {
    const newSnakes = [...snakes];
    let newApples = [...currentApples];

    newSnakes.forEach((snake, i) => {
      if (!snake.alive) return;
      
      const head = snake.positions[0];

      // Verificar colisión con sí misma
      for (let j = 1; j < snake.positions.length; j++) {
        if (head.x === snake.positions[j].x && head.y === snake.positions[j].y) {
          // Al morir, generar nuevas manzanas
          const explosionApples = Array(5).fill(null).map(generateApple);
          newApples = [...newApples, ...explosionApples].slice(0, APPLE_COUNT * 2); // Limitar el número máximo de manzanas

          const respawnSnake = createSnake(
            snake.id,
            [5, 25, 5, 25][snake.id],
            [5, 25, 25, 5][snake.id],
            ['RIGHT', 'LEFT', 'UP', 'DOWN'][snake.id] as Direction,
            snake.color
          );
          newSnakes[i] = respawnSnake;
          return;
        }
      }

      // Colisión con otras serpientes
      newSnakes.forEach((otherSnake, j) => {
        if (i === j || !otherSnake.alive) return;

        otherSnake.positions.forEach((segment, index) => {
          if (head.x === segment.x && head.y === segment.y) {
            if (index === 0) {
              if (snake.positions.length > otherSnake.positions.length) {
                snake.score += otherSnake.positions.length;
                for (let k = 0; k < otherSnake.positions.length; k++) {
                  snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
                }
                const respawnSnake = createSnake(
                  otherSnake.id,
                  [5, 25, 5, 25][otherSnake.id],
                  [5, 25, 25, 5][otherSnake.id],
                  ['RIGHT', 'LEFT', 'UP', 'DOWN'][otherSnake.id] as Direction,
                  otherSnake.color
                );
                newSnakes[j] = respawnSnake;
              } else {
                otherSnake.score += snake.positions.length;
                for (let k = 0; k < snake.positions.length; k++) {
                  otherSnake.positions.push({ ...otherSnake.positions[otherSnake.positions.length - 1] });
                }
                const respawnSnake = createSnake(
                  snake.id,
                  [5, 25, 5, 25][snake.id],
                  [5, 25, 25, 5][snake.id],
                  ['RIGHT', 'LEFT', 'UP', 'DOWN'][snake.id] as Direction,
                  snake.color
                );
                newSnakes[i] = respawnSnake;
              }
            } else {
              otherSnake.score += snake.positions.length;
              for (let k = 0; k < snake.positions.length; k++) {
                otherSnake.positions.push({ ...otherSnake.positions[otherSnake.positions.length - 1] });
              }
              const respawnSnake = createSnake(
                snake.id,
                [5, 25, 5, 25][snake.id],
                [5, 25, 25, 5][snake.id],
                ['RIGHT', 'LEFT', 'UP', 'DOWN'][snake.id] as Direction,
                snake.color
              );
              newSnakes[i] = respawnSnake;
            }
          }
        });
      });
    });

    return { newSnakes, newApples };
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
          
          // Reemplazar la manzana comida con una nueva en una posición aleatoria
          finalApples[appleIndex] = generateApple();
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

      // Asegurarse de que siempre haya al menos APPLE_COUNT manzanas
      while (finalApples.length < APPLE_COUNT) {
        finalApples.push(generateApple());
      }

      return {
        ...prevState,
        snakes: snakesToUpdate,
        apples: finalApples.slice(0, APPLE_COUNT) // Mantener solo APPLE_COUNT manzanas
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
