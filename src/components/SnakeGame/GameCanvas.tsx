
import React, { useEffect, useRef } from 'react';
import { GameState } from './types';
import { CELL_SIZE, GRID_SIZE } from './constants';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar el canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar manzanas
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

    // Dibujar serpientes
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

        // Dibujar ojos para la cabeza de la serpiente
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Asegurar que el canvas tenga las dimensiones correctas
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;

    const animationFrame = requestAnimationFrame(drawGame);
    return () => cancelAnimationFrame(animationFrame);
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIZE * CELL_SIZE}
      height={GRID_SIZE * CELL_SIZE}
      className="border border-gray-800 bg-black rounded-lg shadow-lg"
    />
  );
};

export default GameCanvas;
