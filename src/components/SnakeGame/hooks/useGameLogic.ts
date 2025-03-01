import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from '../types';
import { GRID_SIZE, APPLE_COUNT, FPS } from '../constants';
import { moveSnake } from '../snakeMovement';
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
  
  const [generationInfo, setGenerationInfo] = useState<{ 
    generation: number, 
    bestScore: number, 
    progress: number 
  }>({
    generation: 1,
    bestScore: 0,
    progress: 0
  });

  const [startTime, setStartTime] = useState(Date.now());
  const [isGameRunning, setIsGameRunning] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingUpdate = useRef(false);
  const gamesPlayedRef = useRef(0);

  const ensureMinimumApples = useCallback((apples: typeof gameState.apples) => {
    const minimumApples = 5;
    if (apples.length < minimumApples) {
      const newApples = Array.from(
        { length: minimumApples - apples.length },
        generateApple
      );
      return [...apples, ...newApples];
    }
    return apples;
  }, []);

  const initializeGame = useCallback(async () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    gamesPlayedRef.current++;
    console.log(`Iniciando partida #${gamesPlayedRef.current}`);

    // Create snakes with neural networks
    const snakePromises = Array.from({ length: 4 }, async (_, i) => {
      const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
      return await createSnake(i, spawnX, spawnY, direction, color);
    });
    
    const snakes = await Promise.all(snakePromises);
    
    // Update generation info
    const highestGeneration = Math.max(...snakes.map(s => s.brain.getGeneration()));
    const highestScore = Math.max(...snakes.map(s => s.brain.getBestScore()));
    const highestProgress = Math.max(...snakes.map(s => s.brain.getProgressPercentage()));
    
    setGenerationInfo({
      generation: highestGeneration,
      bestScore: highestScore,
      progress: highestProgress
    });

    const apples = Array.from({ length: APPLE_COUNT }, generateApple);

    setGameState({
      snakes,
      apples,
      gridSize: GRID_SIZE,
    });

    setStartTime(Date.now());
    setIsGameRunning(true);
    isProcessingUpdate.current = false;
  }, []);

  const endRound = useCallback(async () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    setIsGameRunning(false);
    isProcessingUpdate.current = false;

    const maxScore = Math.max(...gameState.snakes.map(snake => snake.score));
    
    if (maxScore > 0) {
      const winners = gameState.snakes.filter(snake => snake.score === maxScore);
      
      setVictories(prevVictories => {
        const newVictories = { ...prevVictories };
        winners.forEach(winner => {
          console.log(`Snake ${winner.id} ganó con ${winner.score} puntos!`);
          newVictories[winner.id] = (prevVictories[winner.id] || 0) + 1;
        });
        return newVictories;
      });
      
      // Save the winning models
      for (const winner of winners) {
        await winner.brain.save(winner.score);
      }
    }

    // Also save non-winners if they have a good score
    for (const snake of gameState.snakes) {
      if (snake.score > 5 && !winners?.some(w => w.id === snake.id)) {
        await snake.brain.save(snake.score);
      }
    }

    setTimeout(initializeGame, 2000);
  }, [gameState.snakes, initializeGame]);

  const updateGame = useCallback(() => {
    if (!isGameRunning || isProcessingUpdate.current) return;

    isProcessingUpdate.current = true;

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
        
        // Gather more information about the environment for better decision making
        const distanceToWalls = [
          head.x,                    // Distance to left wall
          GRID_SIZE - head.x,        // Distance to right wall
          head.y,                    // Distance to top wall
          GRID_SIZE - head.y         // Distance to bottom wall
        ];
        
        // Find closest apple
        let closestApple = prevState.apples[0];
        let minDistance = Number.MAX_VALUE;
        
        for (const apple of prevState.apples) {
          const distance = Math.abs(head.x - apple.position.x) + Math.abs(head.y - apple.position.y);
          if (distance < minDistance) {
            minDistance = distance;
            closestApple = apple;
          }
        }
        
        // Check for obstacles in each direction
        const obstacles = [0, 0, 0, 0]; // UP, RIGHT, DOWN, LEFT
        
        // Self-collision detection (avoid its own body)
        for (let i = 1; i < snake.positions.length; i++) {
          const segment = snake.positions[i];
          
          if (head.x === segment.x && head.y - 1 === segment.y) obstacles[0] = 1; // UP
          if (head.x + 1 === segment.x && head.y === segment.y) obstacles[1] = 1; // RIGHT
          if (head.x === segment.x && head.y + 1 === segment.y) obstacles[2] = 1; // DOWN
          if (head.x - 1 === segment.x && head.y === segment.y) obstacles[3] = 1; // LEFT
        }
        
        // Other snakes detection
        for (const otherSnake of prevState.snakes) {
          if (otherSnake.id === snake.id) continue;
          
          for (const segment of otherSnake.positions) {
            if (head.x === segment.x && head.y - 1 === segment.y) obstacles[0] = 1;
            if (head.x + 1 === segment.x && head.y === segment.y) obstacles[1] = 1;
            if (head.x === segment.x && head.y + 1 === segment.y) obstacles[2] = 1;
            if (head.x - 1 === segment.x && head.y === segment.y) obstacles[3] = 1;
          }
        }
        
        // Create inputs for neural network
        const inputs = [
          // Normalized inputs for better learning
          head.x / GRID_SIZE,                          // Normalized x position
          head.y / GRID_SIZE,                          // Normalized y position
          closestApple.position.x / GRID_SIZE,         // Normalized apple x
          closestApple.position.y / GRID_SIZE,         // Normalized apple y
          ...distanceToWalls.map(d => d / GRID_SIZE),  // Normalized distances to walls
          ...obstacles                                 // Obstacle indicators
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
          
          // Learning with reward proportional to score (encourages longer-term strategies)
          const reward = 1 + (snake.score * 0.1); // Increasing reward for consecutive apples
          
          // The inputs used in the last prediction
          const lastInputs = [
            head.x / GRID_SIZE,
            head.y / GRID_SIZE,
            finalApples[appleIndex].position.x / GRID_SIZE, 
            finalApples[appleIndex].position.y / GRID_SIZE,
            // Add other inputs as used in the prediction above
          ];
          
          snake.brain.learn(true, lastInputs, [], reward);
          
          // Aseguramos que la serpiente tenga el tamaño correcto: 3 (inicial) + score (manzanas comidas)
          while (snake.positions.length < 3 + snake.score) {
            snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
          }
          
          finalApples.splice(appleIndex, 1);
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
  }, [isGameRunning, startTime, endRound, ensureMinimumApples]);

  useEffect(() => {
    initializeGame();
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      setIsGameRunning(false);
    };
  }, [initializeGame]);

  useEffect(() => {
    if (!isGameRunning) return;
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = setInterval(updateGame, 1000 / FPS);
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [isGameRunning, updateGame]);

  return { gameState, victories, startTime, generationInfo };
};
