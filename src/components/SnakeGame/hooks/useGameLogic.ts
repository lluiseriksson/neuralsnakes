import { useState, useEffect } from 'react';
import { GameState, Position } from '../types';
import { GRID_SIZE, APPLE_COUNT, FPS } from '../constants';
import { moveSnake } from '../utils';
import { createSnake, generateSnakeSpawnConfig } from './useSnakeCreation';
import { generateApple } from './useAppleGeneration';
import { checkCollisions } from './useCollisionDetection';

const getManhattanDistance = (p1: Position, p2: Position): number => {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
};

const getNearestObstacles = (head: Position, gameState: GameState, snakeId: number) => {
  const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const obstacles: { [key: string]: number } = {};

  directions.forEach(direction => {
    let minDistance = GRID_SIZE * 2;

    gameState.snakes.forEach(otherSnake => {
      if (otherSnake.id === snakeId || !otherSnake.alive) return;

      otherSnake.positions.forEach(pos => {
        let distance = -1;
        switch(direction) {
          case 'UP':
            if (pos.x === head.x && pos.y < head.y) {
              distance = head.y - pos.y;
            }
            break;
          case 'DOWN':
            if (pos.x === head.x && pos.y > head.y) {
              distance = pos.y - head.y;
            }
            break;
          case 'LEFT':
            if (pos.y === head.y && pos.x < head.x) {
              distance = head.x - pos.x;
            }
            break;
          case 'RIGHT':
            if (pos.y === head.y && pos.x > head.x) {
              distance = pos.x - head.x;
            }
            break;
        }
        if (distance > 0 && distance < minDistance) {
          minDistance = distance;
        }
      });
    });

    obstacles[direction] = minDistance === GRID_SIZE * 2 ? -1 : minDistance / GRID_SIZE;
  });

  return obstacles;
};

const getNearestApples = (head: Position, apples: GameState['apples']): number[] => {
  const sortedApples = [...apples]
    .sort((a, b) => 
      getManhattanDistance(head, a.position) - getManhattanDistance(head, b.position)
    )
    .slice(0, 3);

  const result: number[] = [];
  sortedApples.forEach(apple => {
    const dx = (apple.position.x - head.x) / GRID_SIZE;
    const dy = (apple.position.y - head.y) / GRID_SIZE;
    result.push(dx, dy);
  });

  while (result.length < 6) {
    result.push(-1);
  }

  return result;
};

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
      const newSnakes = prevState.snakes.map(snake => {
        if (!snake.alive) return snake;
        
        const head = snake.positions[0];
        
        const obstacles = getNearestObstacles(head, prevState, snake.id);
        
        const appleInfo = getNearestApples(head, prevState.apples);
        
        const inputs = [
          head.x / GRID_SIZE,
          head.y / GRID_SIZE,
          snake.direction === 'UP' ? 1 : 0,
          snake.direction === 'DOWN' ? 1 : 0,
          snake.direction === 'LEFT' ? 1 : 0,
          snake.direction === 'RIGHT' ? 1 : 0,
          obstacles['UP'],
          obstacles['DOWN'],
          obstacles['LEFT'],
          obstacles['RIGHT'],
          ...appleInfo
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

        if (snake.score >= 100) {
          const successfulBrain = snake.brain.clone();
          
          setVictories(prev => ({
            ...prev,
            [snake.id]: prev[snake.id] + 1
          }));

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
