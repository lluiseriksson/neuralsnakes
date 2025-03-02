
import { useEffect, useCallback, useRef } from 'react';
import { useGameState } from './useGameState';
import { useGameLoop } from './useGameLoop';
import { useGameControls } from './useGameControls';
import { useGameInitialization } from './useGameInitialization'; // Import stays the same because of index.ts
import { useGameUpdate } from './useGameUpdate';
import { useRoundManagement } from './useRoundManagement';
import { useAppleManagement } from './useAppleManagement';

export const useGameLogic = () => {
  // Extract game state management
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

  // Extract apple management logic
  const { ensureMinimumApples } = useAppleManagement();

  // Initialize game loop refs
  const gamesPlayedRef = useRef(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingUpdate = useRef(false);
  const frameCountRef = useRef(0);
  
  // Extract game initialization logic
  const { initializeGame } = useGameInitialization(
    setGameState,
    setStartTime,
    setIsGameRunning,
    setGenerationInfo,
    gameLoopRef,
    isProcessingUpdate,
    gamesPlayedRef
  );

  // Extract round management logic
  const { endRound } = useRoundManagement(
    gameState,
    setVictories,
    setIsGameRunning,
    isProcessingUpdate,
    gameLoopRef,
    initializeGame
  );

  // Extract game update logic
  const { updateGame } = useGameUpdate(
    isGameRunning,
    startTime,
    isProcessingUpdate,
    setGameState,
    endRound,
    ensureMinimumApples
  );

  // Extract game loop logic
  const {  } = useGameLoop(
    isGameRunning,
    updateGame
  );

  // Extract game controls
  const { restartGame } = useGameControls(
    initializeGame,
    gameLoopRef,
    isProcessingUpdate,
    setIsGameRunning
  );

  // Inicialización inicial - convertida a useCallback para evitar recreaciones
  const startGame = useCallback(async () => {
    console.log("useGameLogic: Solicitando inicialización inicial del juego");
    await initializeGame();
    console.log("useGameLogic: Inicialización inicial completada");
  }, [initializeGame]);

  // Initialize game when component mounts - only once
  useEffect(() => {
    console.log("useGameLogic: Efecto de montaje ejecutado");
    startGame().catch(error => {
      console.error("Error en la inicialización inicial:", error);
    });
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      console.log("useGameLogic: Limpieza al desmontar");
    };
  }, [startGame, gameLoopRef]);

  // Devolver tanto initializeGame como restartGame
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
