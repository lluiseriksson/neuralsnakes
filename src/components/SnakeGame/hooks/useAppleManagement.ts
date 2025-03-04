
import { useCallback } from 'react';
import { generateApple, generateNonCollidingApple } from './useAppleGeneration';
import { GameState } from '../types';
import { APPLE_COUNT } from '../constants';

export const useAppleManagement = () => {
  const ensureMinimumApples = useCallback((apples: GameState['apples'], snakes?: GameState['snakes']) => {
    const minimumApples = APPLE_COUNT;
    
    // Log the current apple count for debugging
    console.log(`Current apple count: ${apples.length}, minimum required: ${minimumApples}`);
    
    if (apples.length < minimumApples) {
      console.log(`Adding ${minimumApples - apples.length} new apples`);
      
      // Use non-colliding apple generation if snakes are provided
      if (snakes && snakes.length > 0) {
        const newApples = Array.from(
          { length: minimumApples - apples.length },
          (_, index) => generateNonCollidingApple(snakes, apples, index)
        );
        
        const result = [...apples, ...newApples];
        console.log(`New total apple count: ${result.length}`);
        return result;
      } else {
        // Fallback to regular apple generation if no snakes provided
        const newApples = Array.from(
          { length: minimumApples - apples.length },
          (_, index) => generateApple(index)
        );
        
        const result = [...apples, ...newApples];
        console.log(`New total apple count: ${result.length}`);
        return result;
      }
    }
    
    return apples;
  }, []);

  return { ensureMinimumApples };
};
