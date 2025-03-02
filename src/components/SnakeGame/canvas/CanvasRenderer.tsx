
import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../types';
import { CELL_SIZE, GRID_SIZE } from '../constants';
import { drawGrid, drawApples, drawSnakes, drawDebugInfo } from './drawingUtils';

interface CanvasRendererProps {
  gameState: GameState;
  width: number;
  height: number;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ gameState, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameCount, setFrameCount] = useState(0);
  const lastDrawnStateRef = useRef<string>('');
  // Add state for active snake to highlight
  const [activeSnakeId, setActiveSnakeId] = useState<number | null>(null);

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas no encontrado");
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      console.log("Contexto 2D no disponible");
      return;
    }

    // Only redraw if game state has changed
    const currentStateHash = JSON.stringify({
      snakes: gameState.snakes.map(s => ({ 
        pos: s.positions, 
        alive: s.alive,
        direction: s.direction
      })),
      apples: gameState.apples
    });
    
    if (currentStateHash === lastDrawnStateRef.current) {
      return;
    }
    
    lastDrawnStateRef.current = currentStateHash;
    console.log("Dibujando nuevo estado", frameCount);

    // Clear canvas completely
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, GRID_SIZE, CELL_SIZE);
    
    // Draw apples
    drawApples(ctx, gameState.apples, frameCount, CELL_SIZE);
    
    // Draw snakes
    drawSnakes(ctx, gameState.snakes, CELL_SIZE);
    
    // Draw debug info for all active snakes
    gameState.snakes.forEach(snake => {
      if (snake.alive) {
        drawDebugInfo(ctx, snake, CELL_SIZE);
      }
    });

    setFrameCount(prev => (prev + 1) % 30);
  };

  // Watch for click events on the canvas to select a snake
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
      const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
      
      // Find if a snake head was clicked
      gameState.snakes.forEach(snake => {
        if (snake.alive && snake.positions[0].x === x && snake.positions[0].y === y) {
          setActiveSnakeId(snake.id);
          
          // Create a custom event that bubbles up to parent components
          const selectSnakeEvent = new CustomEvent('selectSnake', { 
            bubbles: true, 
            detail: { snakeId: snake.id } 
          });
          canvas.dispatchEvent(selectSnakeEvent);
        }
      });
    };
    
    canvas.addEventListener('click', handleCanvasClick);
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [gameState.snakes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ensure canvas size is correctly set
    canvas.width = width;
    canvas.height = height;
    
    console.log(`Canvas inicializado: ${canvas.width}x${canvas.height}`);

    let animationFrameId: number;
    const render = () => {
      drawGame();
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [width, height]);

  useEffect(() => {
    drawGame();
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'block', // Ensure canvas is displayed
        cursor: 'pointer', // Show pointer cursor to indicate clickable
      }}
      className="border border-gray-800 bg-black rounded-lg shadow-lg"
      title="Click on a snake to select it"
    />
  );
};

export default CanvasRenderer;
