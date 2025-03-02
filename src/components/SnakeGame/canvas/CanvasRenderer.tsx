
import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../types';
import { CELL_SIZE, GRID_SIZE } from '../constants';
import { 
  drawGrid, 
  drawApples, 
  drawSnakes, 
  drawDebugInfo 
} from './drawing';

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
  // State and refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameCount, setFrameCount] = useState(0);
  const lastDrawnStateRef = useRef<string>('');
  const [activeSnakeId, setActiveSnakeId] = useState<number | null>(null);

  const effectiveSelectedSnakeId = selectedSnakeId !== null ? selectedSnakeId : activeSnakeId;

  // Main drawing function
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

    // Create a state hash to avoid unnecessary redraws
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
    
    // Skip redraw if nothing has changed
    if (currentStateHash === lastDrawnStateRef.current) {
      return;
    }
    
    lastDrawnStateRef.current = currentStateHash;
    console.log("Dibujando nuevo estado", frameCount);

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawGrid(ctx, GRID_SIZE, CELL_SIZE);
    drawApples(ctx, gameState.apples, frameCount, CELL_SIZE);
    drawSnakes(ctx, gameState.snakes, CELL_SIZE, effectiveSelectedSnakeId);
    
    // Draw debug info for living snakes
    gameState.snakes.forEach(snake => {
      if (snake.alive) {
        drawDebugInfo(ctx, snake, CELL_SIZE);
      }
    });

    // Update frame counter
    setFrameCount(prev => (prev + 1) % 30);
  };

  // Handle canvas click events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
      const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
      
      // Check if a snake head was clicked
      gameState.snakes.forEach(snake => {
        if (snake.alive && snake.positions[0].x === x && snake.positions[0].y === y) {
          setActiveSnakeId(snake.id);
          
          // Dispatch custom event for parent components
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

  // Update activeSnakeId when selectedSnakeId changes
  useEffect(() => {
    if (selectedSnakeId !== null) {
      setActiveSnakeId(selectedSnakeId);
    }
  }, [selectedSnakeId]);

  // Initialize canvas and animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    console.log(`Canvas inicializado: ${canvas.width}x${canvas.height}`);

    // Set up animation loop
    let animationFrameId: number;
    const render = () => {
      drawGame();
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    // Clean up animation loop on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [width, height]);

  // Trigger redraw when gameState changes
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
