
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar manzanas - Ahora más grandes y claramente visibles
    gameState.apples.forEach(apple => {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(
        apple.position.x * CELL_SIZE + CELL_SIZE / 2,
        apple.position.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Brillo
      ctx.fillStyle = '#ff6666';
      ctx.beginPath();
      ctx.arc(
        apple.position.x * CELL_SIZE + CELL_SIZE / 3,
        apple.position.y * CELL_SIZE + CELL_SIZE / 3,
        2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Dibujar serpientes
    gameState.snakes.forEach(snake => {
      if (!snake.alive) return;
      
      // Dibujar cuerpo
      snake.positions.forEach((position, index) => {
        ctx.fillStyle = snake.color;
        ctx.beginPath();
        ctx.arc(
          position.x * CELL_SIZE + CELL_SIZE / 2,
          position.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2 - 1,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Dibujar ojos en la cabeza
        if (index === 0) {
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(
            position.x * CELL_SIZE + CELL_SIZE / 3,
            position.y * CELL_SIZE + CELL_SIZE / 3,
            3,
            0,
            2 * Math.PI
          );
          ctx.arc(
            position.x * CELL_SIZE + 2 * CELL_SIZE / 3,
            position.y * CELL_SIZE + CELL_SIZE / 3,
            3,
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

    // Establecer dimensiones del canvas
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;

    // Dibujar el juego
    const animationFrame = requestAnimationFrame(drawGame);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${GRID_SIZE * CELL_SIZE}px`,
        height: `${GRID_SIZE * CELL_SIZE}px`,
      }}
      className="border border-gray-800 bg-black rounded-lg shadow-lg"
    />
  );
};

export default GameCanvas;
