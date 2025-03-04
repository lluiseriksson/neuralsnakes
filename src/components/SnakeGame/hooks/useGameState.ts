
import { useState, useEffect } from 'react';
import { GameState } from '../types';
import { GRID_SIZE, APPLE_COUNT } from '../constants';
import { generateApple } from './useAppleGeneration';
import { getCurrentGeneration, resetHighestScore } from './snakeCreation/modelCache';

export const useGameState = () => {
  // Reset the highest score on component mount
  useEffect(() => {
    resetHighestScore();
    console.log("High score reset on game state initialization");
  }, []);

  // Get the current generation from cache when initializing
  const initialGeneration = getCurrentGeneration() || 1;
  
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
  
  // Enhanced generation tracking with proper initialization
  const [generationInfo, setGenerationInfo] = useState<{ 
    generation: number, 
    bestScore: number, 
    progress: number,
    snakeGenerations: { [key: number]: number } // Track individual snake generations
  }>({
    generation: initialGeneration,
    bestScore: 0,
    progress: 0,
    snakeGenerations: {
      0: initialGeneration, // Yellow snake
      1: initialGeneration,
      2: initialGeneration,
      3: initialGeneration
    }
  });

  const [startTime, setStartTime] = useState(Date.now());
  const [isGameRunning, setIsGameRunning] = useState(false);

  return {
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
  };
};
