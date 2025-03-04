
import { useCallback } from 'react';
import { GameState } from '../types';
import { useToast } from "../../../components/ui/use-toast";
import { 
  getModelCache, 
  updateCurrentGeneration, 
  incrementGeneration, 
  trackGamePlayed, 
  resetModelCaches, 
  forceGenerationUpdate,
  advanceGenerationBasedOnMetrics,
  getCurrentGeneration 
} from './snakeCreation/modelCache';
import { GameRecorder } from '../database/gameRecordingService';

export const useRoundManagement = (
  gameState: GameState,
  setVictories: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>,
  setIsGameRunning: React.Dispatch<React.SetStateAction<boolean>>,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  gameLoopRef: React.MutableRefObject<NodeJS.Timeout | null>,
  initializeGame: () => void,
  recorderRef?: React.MutableRefObject<GameRecorder>,
  isRecordingRef?: React.MutableRefObject<boolean>
) => {
  const { toast } = useToast();
  
  // Función para finalizar la ronda y guardar grabación si está activa
  const endRound = useCallback(async () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    setIsGameRunning(false);
    isProcessingUpdate.current = false;

    // Manejar grabación si está activa
    let recordingId = null;
    if (isRecordingRef?.current && recorderRef?.current) {
      try {
        // Detener grabación
        const recording = recorderRef.current.stopRecording();
        isRecordingRef.current = false;
        
        if (recording) {
          // Guardar grabación
          recordingId = await recorderRef.current.saveRecording(recording);
          
          if (recordingId) {
            console.log(`🎥 Grabación guardada automáticamente al final de la ronda: ${recordingId}`);
            toast({
              title: "Grabación guardada",
              description: "La partida ha sido grabada y guardada al finalizar la ronda.",
            });
          }
        }
      } catch (error) {
        console.error("Error al guardar grabación al final de la ronda:", error);
      }
    }

    // Get performance metrics from all snakes
    const totalScore = gameState.snakes.reduce((sum, snake) => sum + snake.score, 0);
    const totalApplesEaten = gameState.snakes.reduce((sum, snake) => 
      sum + (snake.decisionMetrics?.applesEaten || 0), 0);
    const totalKills = gameState.snakes.reduce((sum, snake) => 
      sum + (snake.decisionMetrics?.killCount || 0), 0);
    const totalDeaths = gameState.snakes.filter(snake => !snake.alive).length;
    const totalSuicides = gameState.snakes.reduce((sum, snake) => 
      sum + (snake.decisionMetrics?.suicides || 0), 0);
    
    console.log(`Round ended with metrics: score=${totalScore}, apples=${totalApplesEaten}, kills=${totalKills}, deaths=${totalDeaths}, suicides=${totalSuicides}`);
    
    // Always track that a game has been played
    trackGamePlayed();
    
    // Get current generation before updates
    let currentGen = getCurrentGeneration();
    console.log(`Current generation at end of round: ${currentGen}`);
    
    // Use advanced metrics-based generation advancement
    let newGeneration = advanceGenerationBasedOnMetrics(
      totalScore, 
      totalApplesEaten,
      totalKills,
      totalDeaths,
      totalSuicides
    );
    
    console.log(`⚡ Advanced to generation ${newGeneration} based on performance metrics ⚡`);
    
    // Additional increment if exceptional score achieved
    if (totalScore >= 2 || totalApplesEaten >= 3 || totalKills >= 1) {
      // For exceptional performance, increment generation again to advance faster
      newGeneration = incrementGeneration();
      console.log(`⚡ Exceptional performance! Incrementing generation again to ${newGeneration} ⚡`);
    }
    
    // More aggressive cache reset - 90% chance instead of 80%
    if (Math.random() < 0.9) { 
      resetModelCaches();
      console.log("Model caches reset to force fresh model loading");
    }
    
    // Process victories and winners
    if (totalScore > 0) {
      // Find snakes with the maximum score
      const maxScore = Math.max(...gameState.snakes.map(snake => snake.score));
      const winningSnakes = gameState.snakes.filter(snake => snake.score === maxScore);
      
      setVictories(prevVictories => {
        const newVictories = { ...prevVictories };
        winningSnakes.forEach(winner => {
          console.log(`Snake ${winner.id} (${winner.color}) won with ${winner.score} points! (Generation ${winner.brain?.getGeneration?.() || 0})`);
          newVictories[winner.id] = (prevVictories[winner.id] || 0) + 1;
        });
        return newVictories;
      });
      
      // Log current generation state
      console.log(`Current generation before saving winners: ${newGeneration}`);
      
      // Save the winning models with significant generation boost
      for (const winner of winningSnakes) {
        try {
          // Update the winner's best score first
          winner.brain?.updateBestScore?.(winner.score);
          
          // Give winning models an extra generation boost
          const winnerNewGen = newGeneration + 25; // Increased from 15 to 25
          winner.brain?.updateGeneration?.(winnerNewGen);
          
          // Save the model to DB
          const savedId = await winner.brain?.save?.(winner.score);
          console.log(`Saved winning model for snake ${winner.id} (${winner.color}) with score ${winner.score} (gen: ${winner.brain?.getGeneration?.() || 0}) - ID: ${savedId}`);
          
          // Make sure generation tracking is updated
          forceGenerationUpdate(winner.brain?.getGeneration?.() || 0);
        } catch (saveError) {
          console.error(`Error saving winning model for snake ${winner.id}:`, saveError);
        }
      }
    }

    // Save ALL snakes regardless of score with incrementing generations
    for (const snake of gameState.snakes) {
      try {
        snake.brain?.updateBestScore?.(Math.max(snake.score, 0));
        
        // Assign varied generation increments based on performance
        const baseIncrement = newGeneration;
        const performanceBonus = snake.score * 8 + (snake.decisionMetrics?.applesEaten || 0) * 5 - (snake.decisionMetrics?.badDirections || 0) * 0.5;
        const finalIncrement = Math.max(10, Math.floor(performanceBonus));
        
        const snakeNewGen = baseIncrement + finalIncrement;
        snake.brain?.updateGeneration?.(snakeNewGen);
        
        await snake.brain?.save?.(snake.score);
        console.log(`Saved model for snake ${snake.id} (${snake.color}) with score ${snake.score} (gen: ${snake.brain?.getGeneration?.() || 0})`);
        
        // Make sure generation tracking is updated
        forceGenerationUpdate(snake.brain?.getGeneration?.() || 0);
      } catch (saveError) {
        console.error(`Error saving model for snake ${snake.id}:`, saveError);
      }
    }

    // Force a delay to ensure all saves have completed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTimeout(initializeGame, 1500);
  }, [gameState.snakes, initializeGame, gameLoopRef, setIsGameRunning, isProcessingUpdate, setVictories, isRecordingRef, recorderRef, toast]);

  return { endRound };
};
