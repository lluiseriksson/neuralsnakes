
import { useState } from 'react';
import { GameState } from '../types';
import { GRID_SIZE, APPLE_COUNT } from '../constants';
import { generateApple } from './useAppleGeneration';

export const useGameState = () => {
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
  
  // Enhanced generation tracking with more detailed metrics
  const [generationInfo, setGenerationInfo] = useState<{ 
    generation: number, 
    bestScore: number, 
    progress: number,
    totalApplesEaten: number,
    killCount: number,
    totalDeaths: number,
    suicides: number,
    efficiency: number
  }>({
    generation: 1,
    bestScore: 0,
    progress: 0,
    totalApplesEaten: 0,
    killCount: 0,
    totalDeaths: 0,
    suicides: 0,
    efficiency: 0
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
