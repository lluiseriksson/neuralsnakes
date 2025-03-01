
import React, { useEffect, useRef, useState } from 'react';
import { GameState } from './types';
import { CELL_SIZE, GRID_SIZE } from './constants';

interface GameCanvasProps {
  gameState: GameState;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameCount, setFrameCount] = useState(0);

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimización: desactivar alpha
    if (!ctx) return;

    // Limpiar el canvas de manera más eficiente
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Optimizar dibujado de manzanas - Dibujamos todas las manzanas de una vez
    ctx.fillStyle = '#ff0000';
    gameState.apples.forEach(apple => {
      ctx.beginPath();
      ctx.arc(
        apple.position.x * CELL_SIZE + CELL_SIZE / 2,
        apple.position.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Dibujar brillos de manzanas (solo cada 3 frames para optimizar)
    if (frameCount % 3 === 0) {
      ctx.fillStyle = '#ff6666';
      gameState.apples.forEach(apple => {
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
    }

    // Dibujar serpientes - optimizado por color
    gameState.snakes.forEach(snake => {
      if (!snake.alive) return;
      
      // Dibujar cuerpo - agrupar por color para menos cambios de contexto
      ctx.fillStyle = snake.color;
      snake.positions.forEach((position, index) => {
        ctx.beginPath();
        ctx.arc(
          position.x * CELL_SIZE + CELL_SIZE / 2,
          position.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2 - 1,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Dibujar ojos solo en la cabeza y solo cada 2 frames para optimizar
        if (index === 0 && frameCount % 2 === 0) {
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
          ctx.fillStyle = snake.color; // Restaurar color para siguientes iteraciones
        }
      });
    });

    // Incrementar contador de frames para efectos visuales
    setFrameCount(prev => (prev + 1) % 30);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Establecer dimensiones del canvas
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;

    // Dibujar el juego usando requestAnimationFrame para optimizar
    let animationFrameId: number;
    const render = () => {
      drawGame();
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);  // Solo ejecutar una vez al montar

  // Actualizar el juego cuando cambia el estado
  useEffect(() => {
    drawGame();
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
