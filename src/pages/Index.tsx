
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

  const createSnake = (id: number, x: number, y: number, direction: Direction, color: string) => ({
    id,
    positions: generateInitialSnake(x, y),
    direction,
    color,
    score: 0,
    brain: new NeuralNetwork(8, 12, 4),
    alive: true,
    balls: 3  // Cada serpiente comienza con 3 bolas
  });

  const initializeGame = () => {
    const snakes = [
      createSnake(0, 5, 5, 'RIGHT', 'yellow'),
      createSnake(1, 25, 25, 'LEFT', 'blue'),
      createSnake(2, 5, 25, 'UP', 'green'),
      createSnake(3, 25, 5, 'DOWN', 'red')
    ];

    const apples = Array(APPLE_COUNT).fill(null).map(() => ({
      position: {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      },
    }));

    setGameState({ snakes, apples, gridSize: GRID_SIZE });
  };

  const checkCollisions = (snakes: any[]) => {
    const newSnakes = [...snakes];

    // Revisar colisiones entre serpientes
    newSnakes.forEach((snake, i) => {
      if (!snake.alive) return;

      const head = snake.positions[0];

      // Revisar colisión con otras serpientes
      newSnakes.forEach((otherSnake, j) => {
        if (i === j || !otherSnake.alive) return;

        // Colisión con el cuerpo de otra serpiente
        otherSnake.positions.forEach((segment: Position, index: number) => {
          if (head.x === segment.x && head.y === segment.y) {
            // Si choca con la cabeza, el que provocó la colisión gana
            if (index === 0) {
              // La serpiente que provocó la colisión obtiene las bolas
              otherSnake.balls += snake.balls;
              otherSnake.score += 50;
              // Resetear la serpiente que perdió
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

    return newSnakes;
  };

  const updateGame = () => {
    setGameState(prevState => {
      // Mover serpientes
      const newSnakes = prevState.snakes.map(snake => moveSnake(snake, prevState));
      
      // Verificar colisiones entre serpientes
      const snakesAfterCollisions = checkCollisions(newSnakes);
      
      // Verificar colisiones con manzanas
      const newApples = [...prevState.apples];
      snakesAfterCollisions.forEach(snake => {
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
        snakes: snakesAfterCollisions,
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
