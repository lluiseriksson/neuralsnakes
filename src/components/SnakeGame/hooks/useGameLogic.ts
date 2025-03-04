
import { useEffect, useCallback, useRef } from 'react';
import { useGameState } from './useGameState';
import { useGameLoop } from './useGameLoop';
import { useGameControls } from './useGameControls';
import { useGameInitialization } from './useGameInitialization';
import { useGameUpdate } from './useGameUpdate';
import { useRoundManagement } from './useRoundManagement';
import { useAppleManagement } from './useAppleManagement';

export const useGameLogic = () => {
  const {
    gameState,
    setGameState,
    victories,
    setVictories,
    generationInfo,
    setGenerationInfo,
    startTime,
    setStartTime,
    isGameRunning,
    setIsGameRunning
  } = useGameState();

  const { ensureMinimumApples } = useAppleManagement();

  const gamesPlayedRef = useRef(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingUpdate = useRef(false);
  const frameCountRef = useRef(0);
  const timerEndHandled = useRef(false);

  const { initializeGame } = useGameInitialization(
    setGameState,
    setStartTime,
    setIsGameRunning,
    setGenerationInfo,
    gameLoopRef,
    isProcessingUpdate,
    gamesPlayedRef
  );

  const { endRound } = useRoundManagement(
    gameState,
    setVictories,
    setIsGameRunning,
    isProcessingUpdate,
    gameLoopRef,
    initializeGame
  );

  const { updateGame } = useGameUpdate(
    isGameRunning,
    startTime,
    isProcessingUpdate,
    setGameState,
    endRound,
    ensureMinimumApples
  );

  useGameLoop(
    isGameRunning,
    updateGame
  );

  const { restartGame } = useGameControls(
    initializeGame,
    gameLoopRef,
    isProcessingUpdate,
    setIsGameRunning,
    gameState
  );

  // Handle timer end event with improved reliability
  useEffect(() => {
    const handleTimerEnd = (event: Event) => {
      console.log("Timer end event received in useGameLogic", event);
      
      if (isGameRunning && !timerEndHandled.current) {
        console.log("Processing timer end event - ending round");
        timerEndHandled.current = true;
        
        // Force game state to update and end round
        setIsGameRunning(false);
        
        // Add small delay to ensure proper cleanup before ending round
        setTimeout(() => {
          if (gameLoopRef.current) {
            clearInterval(gameLoopRef.current);
            gameLoopRef.current = null;
          }
          endRound();
        }, 200);
      }
    };
    
    window.addEventListener('timer-end', handleTimerEnd);
    
    return () => {
      window.removeEventListener('timer-end', handleTimerEnd);
    };
  }, [isGameRunning, endRound, gameLoopRef, setIsGameRunning]);

  // Reset the timerEndHandled ref when the game state changes
  useEffect(() => {
    if (!isGameRunning) {
      timerEndHandled.current = false;
    }
  }, [isGameRunning]);

  const startGame = useCallback(async () => {
    console.log("useGameLogic: Solicitando inicialización inicial del juego");
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    isProcessingUpdate.current = false;
    timerEndHandled.current = false;
    
    try {
      await initializeGame();
      console.log("useGameLogic: Inicialización inicial completada");
      setIsGameRunning(true);
    } catch (error) {
      console.error("Error crítico en inicialización:", error);
      setIsGameRunning(false);
      setTimeout(() => {
        console.log("Intento de recuperación automática después de error");
        initializeGame().catch(console.error);
      }, 2000);
    }
  }, [initializeGame, gameLoopRef, isProcessingUpdate, setIsGameRunning]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startGame().catch(error => {
        console.error("Error en la inicialización inicial:", error);
        setTimeout(startGame, 2000);
      });
    }, 300);
    
    return () => {
      clearTimeout(timer);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [startGame, gameLoopRef]);

  return { 
    gameState, 
    victories, 
    startTime, 
    generationInfo, 
    initializeGame, 
    restartGame,
    isGameRunning
  };
};
