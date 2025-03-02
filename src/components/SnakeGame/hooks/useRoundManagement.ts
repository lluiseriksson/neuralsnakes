import { useCallback } from 'react';
import { GameState } from '../types';
import { 
  getModelCache, 
  updateCurrentGeneration, 
  incrementGeneration, 
  trackGamePlayed, 
  resetModelCaches, 
  forceGenerationUpdate 
} from './snakeCreation/modelCache';

export const useRoundManagement = (
  gameState: GameState,
  setVictories: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>,
  setIsGameRunning: React.Dispatch<React.SetStateAction<boolean>>,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  gameLoopRef: React.MutableRefObject<NodeJS.Timeout | null>,
  initializeGame: () => void
) => {
  const endRound = useCallback(async () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    setIsGameRunning(false);
    isProcessingUpdate.current = false;

    // Find maximum score among snakes
    const maxScore = Math.max(...gameState.snakes.map(snake => snake.score));
    console.log(`Round ended. Max score: ${maxScore}`);
    
    // Always track that a game has been played
    trackGamePlayed();
    
    // Get current generation
    let currentGen = getModelCache().currentGeneration;
    
    // FIXED: ALWAYS increment generation by at least 5 to force evolution
    let newGeneration = currentGen + 5;
    console.log(`⚡ Forcing significant generation increment from ${currentGen} to ${newGeneration} ⚡`);
    forceGenerationUpdate(newGeneration);
    
    // FIXED: Additional increment if good score achieved
    if (maxScore >= 1) { // FIXED: Lower threshold to 1 to ensure more increments
      // For better scores, increment generation again to advance faster
      newGeneration = incrementGeneration();
      console.log(`⚡ Good score (${maxScore}) achieved! Incrementing generation again to ${newGeneration} ⚡`);
    }
    
    // FIXED: Clear model caches more frequently - 70% chance instead of 50%
    if (Math.random() < 0.7) { 
      resetModelCaches();
      console.log("Model caches reset to force fresh model loading");
    }
    
    if (maxScore > 0) {
      const winningSnakes = gameState.snakes.filter(snake => snake.score === maxScore);
      
      setVictories(prevVictories => {
        const newVictories = { ...prevVictories };
        winningSnakes.forEach(winner => {
          console.log(`Snake ${winner.id} (${winner.color}) ganó con ${winner.score} puntos! (Generación ${winner.brain.getGeneration()})`);
          newVictories[winner.id] = (prevVictories[winner.id] || 0) + 1;
        });
        return newVictories;
      });
      
      // Log current generation state
      console.log(`Current generation before saving: ${newGeneration}`);
      
      // Save the winning models
      for (const winner of winningSnakes) {
        try {
          // Update the winner's best score first
          winner.brain.updateBestScore(winner.score);
          
          // FIXED: Make sure the winning model has the latest generation + 3
          const winnerNewGen = newGeneration + 3;
          winner.brain.updateGeneration(winnerNewGen);
          
          // Save the model to DB
          const savedId = await winner.brain.save(winner.score);
          console.log(`Saved winning model for snake ${winner.id} (${winner.color}) with score ${winner.score} (gen: ${winner.brain.getGeneration()}) - ID: ${savedId}`);
          
          // Make sure generation tracking is updated
          forceGenerationUpdate(winner.brain.getGeneration());
        } catch (saveError) {
          console.error(`Error saving winning model for snake ${winner.id}:`, saveError);
        }
      }
    }

    // FIXED: Save ALL snakes regardless of score with incrementing generations
    for (const snake of gameState.snakes) {
      try {
        snake.brain.updateBestScore(Math.max(snake.score, 0));
        
        // FIXED: Make sure ALL models get the latest generation + random increment
        const randomIncrement = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
        const snakeNewGen = newGeneration + randomIncrement;
        snake.brain.updateGeneration(snakeNewGen);
        
        await snake.brain.save(snake.score);
        console.log(`Saved model for snake ${snake.id} (${snake.color}) with score ${snake.score} (gen: ${snake.brain.getGeneration()})`);
        
        // Make sure generation tracking is updated
        forceGenerationUpdate(snake.brain.getGeneration());
      } catch (saveError) {
        console.error(`Error saving model for snake ${snake.id}:`, saveError);
      }
    }

    // Force a delay to ensure all saves have completed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTimeout(initializeGame, 1500);
  }, [gameState.snakes, initializeGame, gameLoopRef, setIsGameRunning, isProcessingUpdate, setVictories]);

  return { endRound };
};
