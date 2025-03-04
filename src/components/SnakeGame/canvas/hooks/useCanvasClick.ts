
import { useEffect, useState } from 'react';
import { GameState } from '../../types';
import { CELL_SIZE } from '../../constants';

/**
 * Custom hook to handle canvas click events
 */
export const useCanvasClick = (
  gameState: GameState,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  selectedSnakeId: number | null = null
) => {
  const [activeSnakeId, setActiveSnakeId] = useState<number | null>(null);

  // Update activeSnakeId when selectedSnakeId changes
  useEffect(() => {
    if (selectedSnakeId !== null) {
      setActiveSnakeId(selectedSnakeId);
    }
  }, [selectedSnakeId]);

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

  return {
    activeSnakeId
  };
};
