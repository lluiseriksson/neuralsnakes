
import { useEffect, useState } from "react";
import { GameState, Direction } from "../components/SnakeGame/types";
import { NeuralNetwork } from "../components/SnakeGame/NeuralNetwork";
import { GRID_SIZE, APPLE_COUNT, FPS } from "../components/SnakeGame/constants";
import { generateInitialSnake, moveSnake } from "../components/SnakeGame/utils";
import GameCanvas from "../components/SnakeGame/GameCanvas";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    snakes: [],
    apples: [],
    gridSize: GRID_SIZE,
  });

  const initializeGame = () => {
    const snakes = [
      {
        id: 0,
        positions: generateInitialSnake(5, 5),
        direction: 'RIGHT' as Direction,
        color: 'yellow',
        score: 0,
        brain: new NeuralNetwork(8, 12, 4),
        alive: true
      },
      {
        id: 1,
        positions: generateInitialSnake(25, 25),
        direction: 'LEFT' as Direction,
        color: 'blue',
        score: 0,
        brain: new NeuralNetwork(8, 12, 4),
        alive: true
      },
      {
        id: 2,
        positions: generateInitialSnake(5, 25),
        direction: 'UP' as Direction,
        color: 'green',
        score: 0,
        brain: new NeuralNetwork(8, 12, 4),
        alive: true
      },
      {
        id: 3,
        positions: generateInitialSnake(25, 5),
        direction: 'DOWN' as Direction,
        color: 'red',
        score: 0,
        brain: new NeuralNetwork(8, 12, 4),
        alive: true
      }
    ];

    const apples = Array(APPLE_COUNT).fill(null).map(() => ({
      position: {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      },
    }));

    setGameState({ snakes, apples, gridSize: GRID_SIZE });
  };

  const updateGame = () => {
    setGameState(prevState => {
      // Mover serpientes
      const newSnakes = prevState.snakes.map(snake => moveSnake(snake, prevState));
      
      // Verificar colisiones con manzanas
      const newApples = [...prevState.apples];
      newSnakes.forEach(snake => {
        if (!snake.alive) return;

        const head = snake.positions[0];
        const appleIndex = newApples.findIndex(apple => 
          apple.position.x === head.x && apple.position.y === head.y
        );

        if (appleIndex !== -1) {
          snake.score += 10;
          snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
          newApples[appleIndex] = {
            position: {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
            },
          };
        }
      });

      return {
        ...prevState,
        snakes: newSnakes,
        apples: newApples
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Snake AI Battle</h1>
      <div className="relative">
        <GameCanvas gameState={gameState} />
      </div>
      <ScoreBoard snakes={gameState.snakes} />
    </div>
  );
};

export default Index;
