
import { useRef, useEffect } from 'react';
import { FPS } from '../constants';

export const useGameLoop = (
  isGameRunning: boolean,
  updateGame: () => void
) => {
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingUpdate = useRef(false);
  const frameCountRef = useRef(0);

  // Set up game loop whenever isGameRunning changes
  useEffect(() => {
    if (!isGameRunning) {
      console.log("Game loop pausado: el juego no está corriendo");
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    console.log("Configurando game loop con FPS:", FPS);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = setInterval(() => {
      frameCountRef.current += 1;
      if (frameCountRef.current % 10 === 0) {
        console.log(`Frame #${frameCountRef.current}`);
      }
      updateGame();
    }, 1000 / FPS);
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [isGameRunning, updateGame]);

  return {
    gameLoopRef,
    isProcessingUpdate,
    frameCountRef
  };
};
