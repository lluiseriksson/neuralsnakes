
import React, { useRef } from 'react';
import { GameState } from '../types';
import { CELL_SIZE } from '../constants';
import { 
  useCanvasRender, 
  useCanvasClick, 
  useCanvasSetup,
  useAnimationLoop
} from './hooks';

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
  // Canvas reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Custom hooks for canvas functionality
  const { activeSnakeId } = useCanvasClick(gameState, canvasRef, selectedSnakeId);
  const effectiveSelectedSnakeId = selectedSnakeId !== null ? selectedSnakeId : activeSnakeId;
  
  // Canvas rendering hook
  const { drawGame } = useCanvasRender(
    gameState, 
    width, 
    height, 
    canvasRef, 
    effectiveSelectedSnakeId
  );
  
  // Canvas setup hook
  useCanvasSetup(canvasRef, width, height);
  
  // Animation loop hook
  useAnimationLoop(true, drawGame, [gameState]);
  
  // Trigger redraw when gameState changes
  React.useEffect(() => {
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
