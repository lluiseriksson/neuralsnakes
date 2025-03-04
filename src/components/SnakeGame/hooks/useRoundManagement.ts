
import { useCallback } from 'react';
import { GameState } from '../types';
import { useToast } from "../../../components/ui/use-toast";
import { 
  getModelCache, 
  updateCurrentGeneration, 
  incrementGeneration,
  incrementGenerationAfterVictory,
  trackGamePlayed, 
  resetModelCaches, 
  forceGenerationUpdate,
  advanceGenerationBasedOnMetrics,
  getCurrentGeneration,
  updateHighestScore
} from './snakeCreation/modelCache';

export const useRoundManagement = (
  gameState: GameState,
  setVictories: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>,
  setIsGameRunning: React.Dispatch<React.SetStateAction<boolean>>,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  gameLoopRef: React.MutableRefObject<NodeJS.Timeout | null>,
  initializeGame: () => void
) => {
  const { toast } = useToast();
  
  // Helper function to get snake color name based on ID - placed at the function level
  // so it can be used in multiple places within endRound
  const getSnakeColorName = (id: number) => {
    switch (id) {
      case 0: return "Yellow";
      case 1: return "Blue";
      case 2: return "Green";
      case 3: return "Purple";
      default: return `Snake #${id}`;
    }
  };
  
  const endRound = useCallback(async () => {
    console.log("🔴 endRound called - beginning end of round processing");
    
    // Prevent duplicate execution
    if (!gameState.snakes || gameState.snakes.length === 0) {
      console.log("🔴 Preventing endRound execution - no snakes in game state");
      return;
    }

    // Clear any existing game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    // Make sure we stop the game and update processing flag
    setIsGameRunning(false);
    isProcessingUpdate.current = false;

    console.log("🔴 Round ended, processing results");

    // Get performance metrics from all snakes
    const totalScore = gameState.snakes.reduce((sum, snake) => sum + snake.score, 0);
    const totalApplesEaten = gameState.snakes.reduce((sum, snake) => 
      sum + (snake.decisionMetrics?.applesEaten || 0), 0);
    const totalKills = gameState.snakes.reduce((sum, snake) => 
      sum + (snake.decisionMetrics?.killCount || 0), 0);
    const totalDeaths = gameState.snakes.filter(snake => !snake.alive).length;
    const totalSuicides = gameState.snakes.reduce((sum, snake) => 
      sum + (snake.decisionMetrics?.suicides || 0), 0);
    
    console.log(`🔴 Round metrics: score=${totalScore}, apples=${totalApplesEaten}, kills=${totalKills}, deaths=${totalDeaths}, suicides=${totalSuicides}`);
    
    // Explicitly track game played to force generation increment
    trackGamePlayed();
    
    // Get current generation before updates
    let currentGen = getCurrentGeneration();
    console.log(`🔴 Current generation at end of round: ${currentGen}`);
    
    // Update the global highest score
    const maxSnakeScore = Math.max(...gameState.snakes.map(snake => snake.score));
    updateHighestScore(maxSnakeScore);
    
    // Find the snake with the highest score regardless of alive status
    const maxScore = Math.max(...gameState.snakes.map(snake => snake.score));
    
    // Consider any snake with the max score as a winner
    let hasWinner = false;
    if (maxScore > 0) {
      const winningSnakes = gameState.snakes.filter(snake => snake.score === maxScore);
      
      if (winningSnakes.length > 0) {
        console.log(`🔴 Found ${winningSnakes.length} winners with score ${maxScore}`);
        hasWinner = true;
        
        setVictories(prevVictories => {
          const newVictories = { ...prevVictories };
          winningSnakes.forEach(winner => {
            console.log(`🔴 ${getSnakeColorName(winner.id)} Snake (${winner.color}) won with ${winner.score} points! (Generation ${winner.brain.getGeneration()})`);
            newVictories[winner.id] = (prevVictories[winner.id] || 0) + 1;
            
            // Show a toast for the winner with color name
            toast({
              title: `${getSnakeColorName(winner.id)} Snake Wins!`,
              description: `Score: ${winner.score} - Generation: ${winner.brain.getGeneration()}`,
              variant: "default",
            });
          });
          return newVictories;
        });
        
        // VICTORY - Increment generation by a smaller amount for more stability
        incrementGenerationAfterVictory();
        console.log(`🏆 Advanced generation after victory to ${getCurrentGeneration()}`);
        
        // Save the winning models with a moderate generation boost
        for (const winner of winningSnakes) {
          try {
            // Update the winner's best score first
            winner.brain.updateBestScore(winner.score);
            
            // FIXED: Give winning models an appropriate generation boost without inflation
            const currentGlobalGen = getCurrentGeneration();
            winner.brain.updateGeneration(currentGlobalGen);
            
            // Save the model to DB
            const savedId = await winner.brain.save(winner.score);
            console.log(`🔴 Saved winning model for ${getSnakeColorName(winner.id)} Snake (${winner.color}) with score ${winner.score} (gen: ${winner.brain.getGeneration()}) - ID: ${savedId}`);
          } catch (saveError) {
            console.error(`Error saving winning model for ${getSnakeColorName(winner.id)} Snake ${winner.id}:`, saveError);
          }
        }
      }
    }
    
    // Increment generation anyway to ensure it always advances
    // This is a safety measure to guarantee generation advancement
    if (!hasWinner) {
      // Force increment generation by 1 for non-winning games
      incrementGeneration();
      console.log(`⚡ Forced generation increment after game without winner to ${getCurrentGeneration()}`);
    }

    // Save ALL snakes regardless of score
    for (const snake of gameState.snakes) {
      try {
        snake.brain.updateBestScore(Math.max(snake.score, 0));
        
        // Assign generation to match current global generation
        const snakeNewGen = getCurrentGeneration();
        snake.brain.updateGeneration(snakeNewGen);
        
        await snake.brain.save(snake.score);
        console.log(`🔴 Saved model for ${getSnakeColorName(snake.id)} Snake (${snake.color}) with score ${snake.score} (gen: ${snake.brain.getGeneration()})`);
      } catch (saveError) {
        console.error(`Error saving model for ${getSnakeColorName(snake.id)} Snake ${snake.id}:`, saveError);
      }
    }

    // Force a delay to ensure all saves have completed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset model caches randomly to force fresh models
    if (Math.random() < 0.3) {
      resetModelCaches();
      console.log("Model caches reset to force fresh model loading");
    }
    
    // Explicitly initialize a new game after processing is complete
    console.log("🔴 Restarting game after round ended");
    
    try {
      setTimeout(() => {
        initializeGame();
        console.log("🔴 Game successfully restarted");
      }, 1500);
    } catch (error) {
      console.error("🔴 Error restarting game:", error);
      // Fallback attempt if the first restart fails
      setTimeout(() => {
        try {
          initializeGame();
          console.log("🔴 Game restarted on second attempt");
        } catch (secondError) {
          console.error("🔴 Critical failure restarting game:", secondError);
        }
      }, 3000);
    }
  }, [gameState.snakes, initializeGame, gameLoopRef, setIsGameRunning, isProcessingUpdate, setVictories, toast]);

  return { endRound };
};
