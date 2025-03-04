
import { useState, useEffect } from 'react';
import { GameRecording } from "../../SnakeGame/database/gameRecordingService";
import { GameState, Snake, NeuralNetwork } from "../../SnakeGame/types";

// Helper class to create a minimal brain implementation for visualization
class MinimalBrain implements NeuralNetwork {
  private generation: number = 0;
  
  constructor(generation: number = 0) {
    this.generation = generation;
  }
  
  // Implement required methods
  predict(inputs: number[]): number[] { return [0, 0, 0, 0]; }
  learn(success: boolean): void {}
  clone(): NeuralNetwork { return new MinimalBrain(this.generation); }
  save(): Promise<string | null> { return Promise.resolve(null); }
  getId(): string | null { return null; }
  getWeights(): number[] { return []; }
  setWeights(weights: number[]): void {}
  getGeneration(): number { return this.generation; }
  updateGeneration(generation: number): void { this.generation = generation; }
  getBestScore(): number { return 0; }
  getGamesPlayed(): number { return 1; }
  updateBestScore(score: number): void {}
  mutate(mutationRate?: number): void {}
  getProgressPercentage(): number { return 0; }
  saveTrainingData(): Promise<void> { return Promise.resolve(); }
  getPerformanceStats() { return { learningAttempts: 1, successfulMoves: 0, failedMoves: 0 }; }
  setScore(score: number): void {}
}

export function useRecordingPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(null);
  const [activeSnake, setActiveSnake] = useState<Snake | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [currentRecording, setCurrentRecording] = useState<GameRecording | null>(null);

  // Process a snake to ensure it has valid brain properties for visualization
  const processSnake = (snake: Snake): Snake => {
    if (!snake.brain || typeof snake.brain.getGeneration !== 'function') {
      // Create a proper NeuralNetwork implementation
      return {
        ...snake,
        brain: new MinimalBrain()
      };
    }
    return snake;
  };

  // Process all snakes in a game state
  const processGameState = (state: GameState): GameState => {
    return {
      ...state,
      snakes: state.snakes.map(processSnake)
    };
  };

  // Handle playing a recording
  const handlePlayRecording = (recording: GameRecording) => {
    if (!recording.game_data || !recording.game_data.frames || recording.game_data.frames.length === 0) {
      console.error("Invalid recording data");
      return;
    }

    setCurrentRecording(recording);
    
    // Process first frame with valid brain objects
    const firstProcessedState = processGameState(recording.game_data.frames[0]);
    
    setCurrentGameState(firstProcessedState);
    setStartTime(Date.now());
    setCurrentFrame(0);
    setIsPlaying(true);
  };

  // Toggle play/pause
  const togglePlay = () => setIsPlaying(!isPlaying);

  // Select a snake
  const handleSelectSnake = (snake: Snake) => setActiveSnake(snake);

  // Advance frames when playing
  useEffect(() => {
    let frameTimer: number;
    
    if (isPlaying && currentRecording?.game_data?.frames) {
      const frames = currentRecording.game_data.frames;
      
      frameTimer = window.setInterval(() => {
        setCurrentFrame(prev => {
          const nextFrame = prev + 1;
          
          if (nextFrame >= frames.length) {
            setIsPlaying(false);
            return prev; // Stay on last frame
          }
          
          // Process the next frame
          const processedState = processGameState(frames[nextFrame]);
          setCurrentGameState(processedState);
          
          return nextFrame;
        });
      }, 200); // Adjust speed as needed
    }
    
    return () => {
      if (frameTimer) clearInterval(frameTimer);
    };
  }, [isPlaying, currentRecording]);

  return {
    isPlaying,
    currentFrame,
    currentGameState,
    activeSnake,
    startTime,
    currentRecording,
    togglePlay,
    handlePlayRecording,
    handleSelectSnake,
    totalFrames: currentRecording?.game_data?.frames?.length || 0
  };
}
