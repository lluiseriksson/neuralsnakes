
import { useEffect, useRef, useState } from 'react';
import { GameState } from '../../types';
import { drawGrid, drawApples, drawSnakes, drawDebugInfo } from '../drawing';

/**
 * Custom hook to handle the canvas rendering logic
 */
export const useCanvasRender = (
  gameState: GameState, 
  width: number, 
  height: number,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  selectedSnakeId: number | null = null
) => {
  // State to track frame count for animations
  const [frameCount, setFrameCount] = useState(0);
  // Store the last drawn state to avoid unnecessary redraws
  const lastDrawnStateRef = useRef<string>('');

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

    // Force redraw on every frame for smoother animation
    const forceRedraw = frameCount % 2 === 0;

    // Create a state hash to avoid unnecessary redraws when identical
    const currentStateHash = JSON.stringify({
      snakes: gameState.snakes.map(s => ({ 
        pos: s.positions, 
        alive: s.alive,
        direction: s.direction
      })),
      apples: gameState.apples,
      selected: selectedSnakeId,
      frame: forceRedraw ? Date.now() : frameCount // Force more frequent redraws
    });
    
    // Skip redraw if nothing has changed and it's not a forced animation frame
    if (currentStateHash === lastDrawnStateRef.current && !forceRedraw) {
      return;
    }
    
    lastDrawnStateRef.current = currentStateHash;

    // Clear canvas with a solid background to ensure visibility
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements with improved contrast
    drawGrid(ctx, 30, 20);
    drawApples(ctx, gameState.apples, frameCount, 20);
    drawSnakes(ctx, gameState.snakes, 20, selectedSnakeId);
    
    // Draw debug info only for the selected snake to reduce visual clutter
    if (selectedSnakeId !== null) {
      const selectedSnake = gameState.snakes.find(s => s.id === selectedSnakeId);
      if (selectedSnake) {
        drawDebugInfo(ctx, selectedSnake, 20);
      }
    }

    // Update frame counter
    setFrameCount(prev => (prev + 1) % 60);
  };

  return {
    frameCount,
    drawGame
  };
};
