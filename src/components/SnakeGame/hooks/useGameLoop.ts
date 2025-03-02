import { useEffect, useRef } from 'react';
import { useGameState } from './useGameState';
import { useGameInitialization } from './useGameInitialization';
import { useRoundManagement } from './useRoundManagement';
import { useGameUpdate } from './useGameUpdate';

export const useGameLoop = () => {
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
  
  const { initializeGame } = useGameInitialization(setGameState, setGenerationInfo);
  const isProcessingUpdate = useRef(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
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
    (apples) => {
      const minApples = 3;
      if (apples.length < minApples) {
        const newApplesNeeded = minApples - apples.length;
        for (let i = 0; i < newApplesNeeded; i++) {
          // apples.push(generateApple());
        }
      }
      return apples;
    }
  );

  useEffect(() => {
    if (isGameRunning && !isProcessingUpdate.current) {
      gameLoopRef.current = setInterval(updateGame, 60);
    } else if (!isGameRunning && gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isGameRunning, updateGame]);

  return {
    gameState,
    victories,
    generationInfo,
    isGameRunning,
    setIsGameRunning,
    initializeGame,
    startTime,
    setStartTime,
    endRound
  };
};
