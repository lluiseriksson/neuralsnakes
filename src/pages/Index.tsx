
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { 
  type Snake, 
  type Apple, 
  type Position, 
  type GameState, 
  type Direction 
} from "../components/SnakeGame/types";
import { NeuralNetwork } from "../components/SnakeGame/NeuralNetwork";

const GRID_SIZE = 30;
const CELL_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 4;
const APPLE_COUNT = 10;
const FPS = 10;

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    snakes: [],
    apples: [],
    gridSize: GRID_SIZE,
  });

  const initializeGame = () => {
    // Initialize snakes with neural networks
    const snakes: Snake[] = [
      { id: 0, positions: generateInitialSnake(0, 0), direction: 'RIGHT', color: 'yellow', score: 0, brain: new NeuralNetwork(8, 12, 4), alive: true },
      { id: 1, positions: generateInitialSnake(GRID_SIZE-1, 0), direction: 'LEFT', color: 'blue', score: 0, brain: new NeuralNetwork(8, 12, 4), alive: true },
      { id: 2, positions: generateInitialSnake(0, GRID_SIZE-1), direction: 'UP', color: 'green', score: 0, brain: new NeuralNetwork(8, 12, 4), alive: true },
      { id: 3, positions: generateInitialSnake(GRID_SIZE-1, GRID_SIZE-1), direction: 'UP', color: 'purple', score: 0, brain: new NeuralNetwork(8, 12, 4), alive: true },
    ];

    // Generate random apples
    const apples = Array(APPLE_COUNT).fill(null).map(() => ({
      position: {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      },
    }));

    setGameState({ snakes, apples, gridSize: GRID_SIZE });
  };

  const generateInitialSnake = (x: number, y: number): Position[] => {
    return Array(INITIAL_SNAKE_LENGTH).fill(null).map((_, i) => ({
      x,
      y: y + i,
    }));
  };

  const moveSnake = (snake: Snake): Snake => {
    const inputs = getSnakeInputs(snake);
    const outputs = snake.brain.predict(inputs);
    const newDirection = getDirectionFromOutputs(outputs);

    const head = snake.positions[0];
    let newHead = { ...head };

    switch (newDirection) {
      case 'UP':
        newHead.y = (newHead.y - 1 + GRID_SIZE) % GRID_SIZE;
        break;
      case 'DOWN':
        newHead.y = (newHead.y + 1) % GRID_SIZE;
        break;
      case 'LEFT':
        newHead.x = (newHead.x - 1 + GRID_SIZE) % GRID_SIZE;
        break;
      case 'RIGHT':
        newHead.x = (newHead.x + 1) % GRID_SIZE;
        break;
    }

    return {
      ...snake,
      positions: [newHead, ...snake.positions.slice(0, -1)],
      direction: newDirection,
    };
  };

  const getSnakeInputs = (snake: Snake): number[] => {
    const head = snake.positions[0];
    return [
      // Distance to walls
      head.x, head.y,
      GRID_SIZE - head.x, GRID_SIZE - head.y,
      // Distance to nearest apple
      Math.min(...gameState.apples.map(apple => 
        Math.sqrt(Math.pow(apple.position.x - head.x, 2) + Math.pow(apple.position.y - head.y, 2))
      )),
      // Distance to nearest snake
      Math.min(...gameState.snakes
        .filter(s => s.id !== snake.id)
        .map(s => Math.min(...s.positions.map(pos =>
          Math.sqrt(Math.pow(pos.x - head.x, 2) + Math.pow(pos.y - head.y, 2))
        )))
      ),
      // Current direction
      snake.direction === 'UP' || snake.direction === 'DOWN' ? 1 : 0,
      snake.direction === 'LEFT' || snake.direction === 'RIGHT' ? 1 : 0,
    ];
  };

  const getDirectionFromOutputs = (outputs: number[]): Direction => {
    const index = outputs.indexOf(Math.max(...outputs));
    return ['UP', 'DOWN', 'LEFT', 'RIGHT'][index] as Direction;
  };

  const checkCollisions = () => {
    const newGameState = { ...gameState };

    // Check snake-apple collisions
    newGameState.snakes.forEach(snake => {
      if (!snake.alive) return;

      const head = snake.positions[0];
      const appleIndex = newGameState.apples.findIndex(apple => 
        apple.position.x === head.x && apple.position.y === head.y
      );

      if (appleIndex !== -1) {
        // Snake ate an apple
        snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
        snake.score += 10;
        newGameState.apples.splice(appleIndex, 1);
        newGameState.apples.push({
          position: {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          },
        });
      }
    });

    // Check snake-snake collisions
    newGameState.snakes.forEach(snake => {
      if (!snake.alive) return;

      const head = snake.positions[0];
      newGameState.snakes.forEach(otherSnake => {
        if (snake.id === otherSnake.id || !otherSnake.alive) return;

        otherSnake.positions.forEach(pos => {
          if (pos.x === head.x && pos.y === head.y) {
            otherSnake.alive = false;
            snake.score += otherSnake.positions.length;
            snake.positions.push(...Array(otherSnake.positions.length).fill(snake.positions[snake.positions.length - 1]));
          }
        });
      });
    });

    setGameState(newGameState);
  };

  const updateGame = () => {
    setGameState(prevState => ({
      ...prevState,
      snakes: prevState.snakes.map(snake => 
        snake.alive ? moveSnake(snake) : snake
      ),
    }));
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw apples
    gameState.apples.forEach(apple => {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(
        apple.position.x * CELL_SIZE + CELL_SIZE / 2,
        apple.position.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Draw snakes
    gameState.snakes.forEach(snake => {
      if (!snake.alive) return;
      
      snake.positions.forEach((position, index) => {
        ctx.fillStyle = snake.color;
        ctx.beginPath();
        ctx.arc(
          position.x * CELL_SIZE + CELL_SIZE / 2,
          position.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Draw eyes for head
        if (index === 0) {
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(
            position.x * CELL_SIZE + CELL_SIZE / 3,
            position.y * CELL_SIZE + CELL_SIZE / 3,
            2,
            0,
            2 * Math.PI
          );
          ctx.arc(
            position.x * CELL_SIZE + 2 * CELL_SIZE / 3,
            position.y * CELL_SIZE + CELL_SIZE / 3,
            2,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      });
    });
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      updateGame();
      checkCollisions();
    }, 1000 / FPS);

    return () => clearInterval(gameLoop);
  }, [gameState]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(drawGame);
    return () => cancelAnimationFrame(animationFrame);
  }, [gameState]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Snake AI Battle</h1>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border border-gray-800 bg-black rounded-lg shadow-lg"
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {gameState.snakes.map(snake => (
          <div key={snake.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: snake.color }} />
            <span className="font-medium text-white">
              Score: {snake.score} {!snake.alive && '(Dead)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
