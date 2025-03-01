
import { useCallback } from 'react';
import { GRID_SIZE, APPLE_COUNT } from '../constants';
import { GameState } from '../types';
import { generateApple } from './useAppleGeneration';
import { createSnake, generateSnakeSpawnConfig } from './useSnakeCreation';

// Cache para apples iniciales
const cachedInitialApples = Array.from({ length: APPLE_COUNT }, generateApple);

export const useGameInitialization = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  setStartTime: React.Dispatch<React.SetStateAction<number>>,
  setIsGameRunning: React.Dispatch<React.SetStateAction<boolean>>,
  setGenerationInfo: React.Dispatch<React.SetStateAction<{
    generation: number;
    bestScore: number;
    progress: number;
  }>>,
  gameLoopRef: React.MutableRefObject<NodeJS.Timeout | null>,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  gamesPlayedRef: React.MutableRefObject<number>
) => {
  const initializeGame = useCallback(async () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    gamesPlayedRef.current++;
    console.log(`Iniciando partida #${gamesPlayedRef.current}`);

    // Configuración inicial mientras las serpientes cargan
    setGameState(prevState => ({
      ...prevState,
      apples: [...cachedInitialApples],
      gridSize: GRID_SIZE,
    }));

    // Crear serpientes en paralelo para mejor rendimiento
    const snakePromises = Array.from({ length: 4 }, async (_, i) => {
      const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
      return await createSnake(i, spawnX, spawnY, direction, color);
    });
    
    const snakes = await Promise.all(snakePromises);
    
    // Actualizar estado del juego con las serpientes creadas
    setGameState({
      snakes,
      apples: [...cachedInitialApples],
      gridSize: GRID_SIZE,
    });
    
    // Actualizar información de generación
    const highestGeneration = Math.max(...snakes.map(s => s.brain.getGeneration()));
    const highestScore = Math.max(...snakes.map(s => s.brain.getBestScore()));
    const highestProgress = Math.max(...snakes.map(s => s.brain.getProgressPercentage()));
    
    setGenerationInfo({
      generation: highestGeneration,
      bestScore: highestScore,
      progress: highestProgress
    });

    setStartTime(Date.now());
    setIsGameRunning(true);
    isProcessingUpdate.current = false;
  }, [
    gameLoopRef, 
    gamesPlayedRef, 
    setGameState, 
    setStartTime, 
    setIsGameRunning, 
    isProcessingUpdate,
    setGenerationInfo
  ]);

  return { initializeGame };
};
