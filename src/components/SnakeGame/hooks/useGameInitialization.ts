
import { useCallback } from 'react';
import { GRID_SIZE, APPLE_COUNT } from '../constants';
import { GameState } from '../types';
import { generateApple } from './useAppleGeneration';
import { createSnake, generateSnakeSpawnConfig } from './useSnakeCreation';

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

    // Create snakes with neural networks
    const snakePromises = Array.from({ length: 4 }, async (_, i) => {
      const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
      return await createSnake(i, spawnX, spawnY, direction, color);
    });
    
    const snakes = await Promise.all(snakePromises);
    
    // Update generation info
    const highestGeneration = Math.max(...snakes.map(s => s.brain.getGeneration()));
    const highestScore = Math.max(...snakes.map(s => s.brain.getBestScore()));
    const highestProgress = Math.max(...snakes.map(s => s.brain.getProgressPercentage()));
    
    setGenerationInfo({
      generation: highestGeneration,
      bestScore: highestScore,
      progress: highestProgress
    });

    const apples = Array.from({ length: APPLE_COUNT }, generateApple);

    setGameState({
      snakes,
      apples,
      gridSize: GRID_SIZE,
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
