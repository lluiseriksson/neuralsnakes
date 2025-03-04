
import { useRef, useEffect } from 'react';
import { FPS } from '../constants';

export const useGameLoop = (
  isGameRunning: boolean,
  updateGame: () => void
) => {
  // Create a ref to store the animation frame ID
  const animationFrameRef = useRef<number | null>(null);
  // Create a timestamp ref to control frame rate
  const lastUpdateTimeRef = useRef<number>(0);
  // Frame interval in milliseconds
  const frameInterval = 1000 / FPS;

  useEffect(() => {
    console.log(`Configurando game loop con FPS: ${FPS}`);
    
    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Only set up the animation if the game is running
    if (isGameRunning) {
      // Animation loop function using requestAnimationFrame for smoother performance
      const animate = (timestamp: number) => {
        // Skip frames to match desired FPS
        if (timestamp - lastUpdateTimeRef.current >= frameInterval) {
          updateGame();
          lastUpdateTimeRef.current = timestamp;
        }
        
        // Continue the animation loop
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      // Start the animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    // Clean up the animation frame when the component unmounts or when dependencies change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isGameRunning, updateGame, frameInterval]);

  // No need to return anything as we're just setting up the game loop
  return {};
};
