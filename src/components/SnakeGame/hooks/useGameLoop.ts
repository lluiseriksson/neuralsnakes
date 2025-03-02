
import { useRef, useEffect } from 'react';
import { FPS } from '../constants';

export const useGameLoop = (
  isGameRunning: boolean,
  updateGame: () => void
) => {
  // Create a ref to store the interval ID
  const gameLoopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log(`Configurando game loop con FPS: ${FPS}`);
    
    // Clear existing interval if it exists
    if (gameLoopIntervalRef.current) {
      clearInterval(gameLoopIntervalRef.current);
      gameLoopIntervalRef.current = null;
    }
    
    // Only set up the interval if the game is running
    if (isGameRunning) {
      gameLoopIntervalRef.current = setInterval(() => {
        updateGame();
      }, 1000 / FPS);
    }
    
    // Clean up the interval when the component unmounts or when dependencies change
    return () => {
      if (gameLoopIntervalRef.current) {
        clearInterval(gameLoopIntervalRef.current);
        gameLoopIntervalRef.current = null;
      }
    };
  }, [isGameRunning, updateGame]);

  // No need to return anything as we're just setting up the game loop
  return {};
};
