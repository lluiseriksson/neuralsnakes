import { useEffect, useCallback, useRef } from 'react';
import { useGameState } from './useGameState';
import { useGameLoop } from './useGameLoop';
import { useGameControls } from './useGameControls';
import { useGameInitialization } from './useGameInitialization';
import { useGameUpdate } from './useGameUpdate';
import { useRoundManagement } from './useRoundManagement';
import { useAppleManagement } from './useAppleManagement';
import { GameRecorder } from '../database/gameRecordingService';

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
  
  // Ref para el grabador de partidas
  const recorderRef = useRef<GameRecorder>(new GameRecorder());
  const isRecordingRef = useRef<boolean>(false);
  
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

  // Extract round management logic with recording support
  const { endRound } = useRoundManagement(
    gameState,
    setVictories,
    setIsGameRunning,
    isProcessingUpdate,
    gameLoopRef,
    initializeGame,
    recorderRef,
    isRecordingRef
  );

  // Extract game update logic with recording support
  const { updateGame } = useGameUpdate(
    isGameRunning,
    startTime,
    isProcessingUpdate,
    setGameState,
    endRound,
    ensureMinimumApples,
    recorderRef,
    isRecordingRef
  );

  // Extract game loop logic
  useGameLoop(
    isGameRunning,
    updateGame
  );

  // Extract game controls with recording
  const { restartGame, startRecording, stopRecording, isRecording } = useGameControls(
    initializeGame,
    gameLoopRef,
    isProcessingUpdate,
    setIsGameRunning,
    gameState,
    recorderRef,
    isRecordingRef
  );

  // Inicialización inicial - convertida a useCallback para evitar recreaciones
  const startGame = useCallback(async () => {
    console.log("useGameLogic: Solicitando inicialización inicial del juego");
    // Asegurarnos de limpiar cualquier loop previo
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Reiniciar el estado de procesamiento antes de inicializar
    isProcessingUpdate.current = false;
    
    try {
      await initializeGame();
      console.log("useGameLogic: Inicialización inicial completada");
      
      // Asegurarse explícitamente que el juego comienza a correr
      setIsGameRunning(true);
    } catch (error) {
      console.error("Error crítico en inicialización:", error);
      
      // Intentar recuperar el juego en caso de error
      setIsGameRunning(false);
      setTimeout(() => {
        console.log("Intento de recuperación automática después de error");
        initializeGame().catch(console.error);
      }, 2000);
    }
  }, [initializeGame, gameLoopRef, isProcessingUpdate, setIsGameRunning]);

  // Initialize game when component mounts - only once
  useEffect(() => {
    console.log("useGameLogic: Efecto de montaje ejecutado");
    // Iniciar con un pequeño retraso para asegurar que los componentes están montados
    const timer = setTimeout(() => {
      startGame().catch(error => {
        console.error("Error en la inicialización inicial:", error);
        // Intentar reiniciar en caso de error
        setTimeout(startGame, 2000);
      });
    }, 300);
    
    return () => {
      clearTimeout(timer);
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
    isGameRunning,
    // Funciones de grabación
    startRecording,
    stopRecording,
    isRecording
  };
};
