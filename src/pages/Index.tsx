
import { useEffect, useState } from "react";
import { GameState, Direction, Position, Snake } from "../components/SnakeGame/types";
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

  const [victories, setVictories] = useState<{ [key: number]: number }>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  });

  const createSnake = (id: number, x: number, y: number, direction: Direction, color: string) => ({
    id,
    positions: generateInitialSnake(x, y),
    direction,
    color,
    score: 0,
    brain: new NeuralNetwork(8, 12, 4),
    alive: true
  });

  const initializeGame = () => {
    const snakes = [
      createSnake(0, 5, 5, 'RIGHT', 'yellow'),
      createSnake(1, 25, 25, 'LEFT', 'blue'),
      createSnake(2, 5, 25, 'UP', 'green'),
      createSnake(3, 25, 5, 'DOWN', 'red')
    ];

    // Asegurarnos de que las manzanas se generen en posiciones válidas
    const apples = Array(APPLE_COUNT).fill(null).map(() => ({
      position: {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      },
    }));

    setGameState({ snakes, apples, gridSize: GRID_SIZE });
  };

  const checkCollisions = (snakes: Snake[]) => {
    const newSnakes = [...snakes];
    let newApples = [...gameState.apples]; // Asegurarnos de crear una copia del array

    newSnakes.forEach((snake, i) => {
      if (!snake.alive) return;
      
      const head = snake.positions[0];

      // Verificar colisión con sí misma
      for (let j = 1; j < snake.positions.length; j++) {
        if (head.x === snake.positions[j].x && head.y === snake.positions[j].y) {
          // Generar 10 manzanas alrededor del punto de muerte
          const explosionApples = Array(10).fill(null).map(() => ({
            position: {
              x: Math.max(0, Math.min(GRID_SIZE - 1, head.x + Math.floor(Math.random() * 7) - 3)),
              y: Math.max(0, Math.min(GRID_SIZE - 1, head.y + Math.floor(Math.random() * 7) - 3)),
            },
          }));
          newApples = [...newApples, ...explosionApples];

          // Respawnear la serpiente
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

        // Verificar colisión con cualquier parte de la otra serpiente
        otherSnake.positions.forEach((segment, index) => {
          if (head.x === segment.x && head.y === segment.y) {
            if (index === 0) { // Colisión cabeza con cabeza
              // La serpiente con más longitud gana
              if (snake.positions.length > otherSnake.positions.length) {
                snake.score += otherSnake.positions.length;
                // Aumenta la longitud de la serpiente ganadora
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
                // Aumenta la longitud de la serpiente ganadora
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
            } else { // Colisión con el cuerpo
              otherSnake.score += snake.positions.length;
              // Aumenta la longitud de la serpiente ganadora
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

    setGameState(prev => ({
      ...prev,
      apples: newApples
    }));

    return newSnakes;
  };

  const updateGame = () => {
    setGameState(prevState => {
      // Mover serpientes
      const newSnakes = prevState.snakes.map(snake => moveSnake(snake, prevState));
      
      // Verificar colisiones entre serpientes
      const snakesAfterCollisions = checkCollisions(newSnakes);

      // Verificar colisiones con manzanas y victoria
      const newApples = [...prevState.apples];
      
      snakesAfterCollisions.forEach(snake => {
        if (!snake.alive) return;

        const head = snake.positions[0];
        const appleIndex = newApples.findIndex(apple => 
          apple.position.x === head.x && apple.position.y === head.y
        );

        if (appleIndex !== -1) {
          snake.score += 1;
          snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
          newApples[appleIndex] = {
            position: {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
            },
          };
        }

        // Verificar victoria
        if (snake.score >= 150) {
          setVictories(prev => ({
            ...prev,
            [snake.id]: prev[snake.id] + 1
          }));
          initializeGame(); // Reiniciar el juego
          return;
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
      <div className="mb-4 grid grid-cols-2 gap-4">
        {Object.entries(victories).map(([id, wins]) => (
          <div key={id} className="text-white flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: ['yellow', 'blue', 'green', 'red'][Number(id)] }} 
            />
            <span>Victories: {wins}</span>
          </div>
        ))}
      </div>
      <div className="relative">
        <GameCanvas gameState={gameState} />
      </div>
      <ScoreBoard snakes={gameState.snakes} />
    </div>
  );
};

export default Index;
