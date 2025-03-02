import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../types';
import { CELL_SIZE, GRID_SIZE } from '../constants';
import { drawGrid, drawApples, drawSnakes, drawDebugInfo } from './drawingUtils';

interface CanvasRendererProps {
  gameState: GameState;
  width: number;
  height: number;
  selectedSnakeId?: number | null;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ 
  gameState, 
  width, 
  height,
  selectedSnakeId = null
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameCount, setFrameCount] = useState(0);
  const lastDrawnStateRef = useRef<string>('');
  const [activeSnakeId, setActiveSnakeId] = useState<number | null>(null);

  const effectiveSelectedSnakeId = selectedSnakeId !== null ? selectedSnakeId : activeSnakeId;

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

    const currentStateHash = JSON.stringify({
      snakes: gameState.snakes.map(s => ({ 
        pos: s.positions, 
        alive: s.alive,
        direction: s.direction
      })),
      apples: gameState.apples,
      selected: effectiveSelectedSnakeId,
      frame: frameCount
    });
    
    if (currentStateHash === lastDrawnStateRef.current) {
      return;
    }
    
    lastDrawnStateRef.current = currentStateHash;
    console.log("Dibujando nuevo estado", frameCount);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, GRID_SIZE, CELL_SIZE);
    
    drawApples(ctx, gameState.apples, frameCount, CELL_SIZE);
    
    drawSnakes(ctx, gameState.snakes, CELL_SIZE);
    
    gameState.snakes.forEach(snake => {
      if (snake.alive) {
        drawDebugInfo(ctx, snake, CELL_SIZE);
      }
    });

    setFrameCount(prev => (prev + 1) % 30);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
      const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
      
      gameState.snakes.forEach(snake => {
        if (snake.alive && snake.positions[0].x === x && snake.positions[0].y === y) {
          setActiveSnakeId(snake.id);
          
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
    if (selectedSnakeId !== null) {
      setActiveSnakeId(selectedSnakeId);
    }
  }, [selectedSnakeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
        display: 'block',
        cursor: 'pointer',
      }}
      className="border border-gray-800 bg-black rounded-lg shadow-lg"
      title="Click on a snake to select it"
    />
  );
};

export default CanvasRenderer;
