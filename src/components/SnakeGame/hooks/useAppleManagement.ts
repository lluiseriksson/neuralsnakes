
import { useCallback } from 'react';
import { generateApple } from './useAppleGeneration';
import { GameState } from '../types';

export const useAppleManagement = () => {
  const ensureMinimumApples = useCallback((apples: GameState['apples']) => {
    const minimumApples = 5;
    if (apples.length < minimumApples) {
      const newApples = Array.from(
        { length: minimumApples - apples.length },
        generateApple
      );
      return [...apples, ...newApples];
    }
    return apples;
  }, []);

  return { ensureMinimumApples };
};
