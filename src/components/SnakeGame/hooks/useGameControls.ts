
import { useCallback } from 'react';

export const useGameControls = (
  initializeGame: () => Promise<void>,
  gameLoopRef: React.MutableRefObject<NodeJS.Timeout | null>,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  setIsGameRunning: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Método para reiniciar el juego manualmente
  const restartGame = useCallback(() => {
    console.log("Reiniciando juego manualmente");
    
    // Limpiar el intervalo existente
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Resetear el estado de procesamiento
    isProcessingUpdate.current = false;
    setIsGameRunning(false);
    
    // Inicializar el juego
    return initializeGame();
  }, [initializeGame, gameLoopRef, isProcessingUpdate, setIsGameRunning]);

  return {
    restartGame
  };
};
