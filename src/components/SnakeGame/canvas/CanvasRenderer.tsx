
import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../types';
import { CELL_SIZE, GRID_SIZE } from '../constants';
import { drawGrid, drawApples, drawSnakes } from './drawingUtils';

interface CanvasRendererProps {
  gameState: GameState;
  width: number;
  height: number;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ gameState, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameCount, setFrameCount] = useState(0);
  const lastDrawnStateRef = useRef<string>('');

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

    setFrameCount(prev => (prev + 1) % 30);
  };

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
      }}
      className="border border-gray-800 bg-black rounded-lg shadow-lg"
    />
  );
};

export default CanvasRenderer;
