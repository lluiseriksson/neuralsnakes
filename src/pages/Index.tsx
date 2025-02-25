import { useEffect, useState } from "react";
import { GameState, Direction, Snake } from "../components/SnakeGame/types";
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

  const generateApple = () => ({
    position: {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    },
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

  const checkCollisions = (snakes: Snake[]) => {
    const newSnakes = [...snakes];
    let newApples = [...gameState.apples];

    newSnakes.forEach((snake, i) => {
      if (!snake.alive) return;
      
      const head = snake.positions[0];

      // Verificar colisión con sí misma
      for (let j = 1; j < snake.positions.length; j++) {
        if (head.x === snake.positions[j].x && head.y === snake.positions[j].y) {
          // Generar manzanas al morir
          const explosionApples = Array(10).fill(null).map(generateApple);
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

    return { newSnakes, newApples };
  };

  const updateGame = () => {
    setGameState(prevState => {
      // Mover serpientes
      const newSnakes = prevState.snakes.map(snake => moveSnake(snake, prevState));
      
      // Verificar colisiones entre serpientes
      const { newSnakes: snakesAfterCollisions, newApples } = checkCollisions(newSnakes);

      // Verificar colisiones con manzanas y victoria
      const finalApples = [...newApples];
      
      snakesAfterCollisions.forEach(snake => {
        if (!snake.alive) return;

        const head = snake.positions[0];
        const appleIndex = finalApples.findIndex(apple => 
          apple.position.x === head.x && apple.position.y === head.y
        );

        if (appleIndex !== -1) {
          // Comer manzana
          snake.score += 1;
          snake.positions.push({ ...snake.positions[snake.positions.length - 1] });
          
          // Generar nueva manzana en posición aleatoria
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

      return {
        ...prevState,
        snakes: snakesAfterCollisions,
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
