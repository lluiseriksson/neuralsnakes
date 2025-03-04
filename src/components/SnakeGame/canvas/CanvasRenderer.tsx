
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
      console.log("Canvas not found");
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      console.log("2D context not available");
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
    
    // Skip redraw if nothing has changed and it's not an animation frame
    // Always redraw for better animations
    if (currentStateHash === lastDrawnStateRef.current && frameCount % 2 !== 0) {
      return;
    }
    
    lastDrawnStateRef.current = currentStateHash;

    // Clear canvas with a solid background to ensure visibility
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements with improved contrast
    drawGrid(ctx, GRID_SIZE, CELL_SIZE);
    drawApples(ctx, gameState.apples, frameCount, CELL_SIZE);
    drawSnakes(ctx, gameState.snakes, CELL_SIZE, effectiveSelectedSnakeId);
    
    // Draw debug info only for the selected snake to reduce visual clutter
    if (effectiveSelectedSnakeId !== null) {
      const selectedSnake = gameState.snakes.find(s => s.id === effectiveSelectedSnakeId);
      if (selectedSnake) {
        drawDebugInfo(ctx, selectedSnake, CELL_SIZE);
      }
    }

    // Update frame counter
    setFrameCount(prev => (prev + 1) % 60);
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
        if (snake.alive && snake.positions && snake.positions.length > 0) {
          const head = snake.positions[0];
          // Create a slightly larger hit area for easier selection
          if (Math.abs(head.x - x) <= 1 && Math.abs(head.y - y) <= 1) {
            setActiveSnakeId(snake.id);
            
            // Add visual feedback for the click
            const clickEffect = document.createElement('div');
            clickEffect.className = 'absolute pointer-events-none rounded-full bg-white bg-opacity-70';
            clickEffect.style.left = `${e.clientX - 20}px`;
            clickEffect.style.top = `${e.clientY - 20}px`;
            clickEffect.style.width = '40px';
            clickEffect.style.height = '40px';
            clickEffect.style.animation = 'ping 1s cubic-bezier(0, 0, 0.2, 1)';
            document.body.appendChild(clickEffect);
            
            // Remove the effect after animation completes
            setTimeout(() => {
              document.body.removeChild(clickEffect);
            }, 1000);
            
            // Dispatch custom event for parent components
            const selectSnakeEvent = new CustomEvent('selectSnake', { 
              bubbles: true, 
              detail: { snakeId: snake.id } 
            });
            canvas.dispatchEvent(selectSnakeEvent);
          }
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

    // Set canvas dimensions with pixel ratio for sharper rendering
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Get context and scale for retina displays
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
    }
    
    console.log(`Canvas initialized: ${canvas.width}x${canvas.height} (${pixelRatio}x)`);

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
      className="border-2 border-gray-700 bg-black rounded-lg shadow-xl"
      title="Click on a snake to select it"
    />
  );
};

export default CanvasRenderer;
