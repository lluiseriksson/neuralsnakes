
import { useState, useEffect, useRef } from 'react';
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
  const [isGameRunning, setIsGameRunning] = useState(true);
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

  // Initialize game when component mounts
  useEffect(() => {
    console.log("useGameLogic: Inicializando juego al montar componente");
    initializeGame();
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      setIsGameRunning(false);
    };
  }, []);

  // Set up game loop
  useEffect(() => {
    if (!isGameRunning) {
      console.log("Game loop pausado: el juego no está corriendo");
      return;
    }
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    console.log("Configurando game loop con FPS:", FPS);
    gameLoopRef.current = setInterval(() => {
      frameCountRef.current += 1;
      console.log(`Frame #${frameCountRef.current}`);
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
  const restartGame = () => {
    console.log("Reiniciando juego manualmente");
    
    // Limpiar el intervalo existente
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Resetear el estado de procesamiento
    isProcessingUpdate.current = false;
    
    // Inicializar el juego
    initializeGame();
  };

  // Importante: devolver initializeGame para que pueda ser accedido por otros componentes
  return { 
    gameState, 
    victories, 
    startTime, 
    generationInfo, 
    initializeGame, 
    restartGame 
  };
};
