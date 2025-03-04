
import { useCallback } from 'react';
import { GameState } from '../types';
import { useToast } from '../../../components/ui/use-toast';

export const useGameControls = (
  initializeGame: () => Promise<void>,
  gameLoopRef: React.MutableRefObject<NodeJS.Timeout | null>,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  setIsGameRunning: React.Dispatch<React.SetStateAction<boolean>>,
  gameState?: GameState
) => {
  const { toast } = useToast();

  // Restart game function
  const restartGame = useCallback(() => {
    console.log("useGameControls: Solicitando reinicio del juego");
    
    // Clear existing game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Reset processing flag to avoid state updates getting stuck
    isProcessingUpdate.current = false;
    
    // Stop the game first
    setIsGameRunning(false);
    
    // Initialize a new game after a short delay
    setTimeout(() => {
      initializeGame().catch(error => {
        console.error("Error en el reinicio del juego:", error);
      });
    }, 500);
  }, [gameLoopRef, initializeGame, isProcessingUpdate, setIsGameRunning]);

  return { 
    restartGame
  };
};
