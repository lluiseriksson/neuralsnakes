
import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState } from '../types';
import { GRID_SIZE, APPLE_COUNT, FPS } from '../constants';
import { generateApple } from './useAppleGeneration';
import { useGameInitialization } from './useGameInitialization';
import { useGameUpdate } from './useGameUpdate';
import { useRoundManagement } from './useRoundManagement';
import { useAppleManagement } from './useAppleManagement';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    snakes: [],
    apples: Array.from({ length: APPLE_COUNT }, generateApple),
    gridSize: GRID_SIZE,
  });

  const [victories, setVictories] = useState<{ [key: number]: number }>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  });
  
  const [generationInfo, setGenerationInfo] = useState<{ 
    generation: number, 
    bestScore: number, 
    progress: number 
  }>({
    generation: 1,
    bestScore: 0,
    progress: 0
  });

  const [startTime, setStartTime] = useState(Date.now());
  const [isGameRunning, setIsGameRunning] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingUpdate = useRef(false);
  const gamesPlayedRef = useRef(0);
  const frameCountRef = useRef(0);

  // Extract apple management logic
  const { ensureMinimumApples } = useAppleManagement();

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
  }, [startGame]);

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
  }, [initializeGame]);

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
