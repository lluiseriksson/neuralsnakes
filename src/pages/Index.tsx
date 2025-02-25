
import { useEffect, useState } from "react";
import { GameState, Direction } from "../components/SnakeGame/types";
import { NeuralNetwork } from "../components/SnakeGame/NeuralNetwork";
import { GRID_SIZE, APPLE_COUNT, FPS } from "../components/SnakeGame/constants";
import { generateInitialSnake, moveSnake } from "../components/SnakeGame/utils";
import GameCanvas from "../components/SnakeGame/GameCanvas";
import GameControls from "../components/SnakeGame/GameControls";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    snakes: [],
    apples: [],
    gridSize: GRID_SIZE,
  });
  const [isRunning, setIsRunning] = useState(true); // Iniciar automáticamente

  const initializeGame = () => {
    const initialDirections: Direction[] = ['RIGHT', 'LEFT', 'UP', 'UP'];
    const initialPositions = [
      [0, 0],
      [GRID_SIZE-1, 0],
      [0, GRID_SIZE-1],
      [GRID_SIZE-1, GRID_SIZE-1]
    ];
    
    const snakes = initialPositions.map((pos, index) => ({
      id: index,
      positions: generateInitialSnake(pos[0], pos[1]),
      direction: initialDirections[index] as Direction,
      color: ['yellow', 'blue', 'green', 'purple'][index],
      score: 0,
      brain: new NeuralNetwork(8, 12, 4),
      alive: true
    }));

    const apples = Array(APPLE_COUNT).fill(null).map(() => ({
      position: {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      },
    }));

    setGameState({ snakes, apples, gridSize: GRID_SIZE });
  };

  const checkCollisions = () => {
    const newGameState = { ...gameState };

    newGameState.snakes.forEach(snake => {
      if (!snake.alive) return;

      const head = snake.positions[0];
      const appleIndex = newGameState.apples.findIndex(apple => 
        apple.position.x === head.x && apple.position.y === head.y
      );

      if (appleIndex !== -1) {
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
        snake.alive ? moveSnake(snake, prevState) : snake
      ),
    }));
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let gameLoop: NodeJS.Timeout;
    
    if (isRunning) {
      gameLoop = setInterval(() => {
        updateGame();
        checkCollisions();
      }, 1000 / FPS);
    }

    return () => {
      if (gameLoop) clearInterval(gameLoop);
    };
  }, [gameState, isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(true); // Mantener el juego corriendo después de reset
    initializeGame();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Snake AI Battle</h1>
      <GameControls
        isRunning={isRunning}
        onStartStop={handleStartStop}
        onReset={handleReset}
      />
      <div className="relative">
        <GameCanvas gameState={gameState} />
      </div>
      <ScoreBoard snakes={gameState.snakes} />
    </div>
  );
};

export default Index;
