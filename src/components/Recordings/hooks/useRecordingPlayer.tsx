
import { useState, useEffect } from 'react';
import { GameRecording } from "../../SnakeGame/database/gameRecordingService";
import { GameState, Snake, NeuralNetwork } from "../../SnakeGame/types";

// Helper class to create a minimal brain implementation for visualization
class MinimalBrain implements NeuralNetwork {
  private generation: number = 0;
  private score: number = 0;
  
  constructor(generation: number = 0, score: number = 0) {
    this.generation = generation;
    this.score = score;
  }
  
  // Implement required methods
  predict(inputs: number[]): number[] { return [0, 0, 0, 0]; }
  learn(success: boolean, inputs?: number[], outputs?: number[], reward?: number): void {}
  clone(mutationRate?: number): NeuralNetwork { return new MinimalBrain(this.generation, this.score); }
  save(score?: number): Promise<string | null> { return Promise.resolve(null); }
  getId(): string | null { return null; }
  getWeights(): number[] { return []; }
  setWeights(weights: number[]): void {}
  getGeneration(): number { return this.generation; }
  updateGeneration(generation: number): void { this.generation = generation; }
  getBestScore(): number { return this.score; }
  getGamesPlayed(): number { return 1; }
  updateBestScore(score: number): void { this.score = score; }
  mutate(mutationRate?: number): void {}
  getProgressPercentage(): number { return 0; }
  saveTrainingData(): Promise<void> { return Promise.resolve(); }
  getPerformanceStats() { return { learningAttempts: 1, successfulMoves: 0, failedMoves: 0 }; }
  setScore(score: number): void { this.score = score; }
}

export function useRecordingPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(null);
  const [activeSnake, setActiveSnake] = useState<Snake | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [currentRecording, setCurrentRecording] = useState<GameRecording | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(200); // ms per frame

  // Process a snake to ensure it has valid brain properties for visualization
  const processSnake = (snake: Snake): Snake => {
    if (!snake.brain || typeof snake.brain.getGeneration !== 'function') {
      // Get brain data from the snake object if available
      const generation = typeof snake.brain === 'object' && snake.brain !== null ? 
                         (snake.brain.getGeneration ? snake.brain.getGeneration() : 
                          // Fix here: Use proper method call or access mechanism
                          (typeof snake.brain.getGeneration === 'function' ? snake.brain.getGeneration() : 0)) : 0;
      const score = snake.score || 0;
      
      // Create a proper NeuralNetwork implementation
      return {
        ...snake,
        brain: new MinimalBrain(generation, score)
      };
    }
    return snake;
  };

  // Process all snakes in a game state
  const processGameState = (state: GameState): GameState => {
    if (!state.snakes) {
      console.error("Invalid game state - missing snakes array");
      return state;
    }
    
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
    
    try {
      // Process first frame with valid brain objects
      const firstProcessedState = processGameState(recording.game_data.frames[0]);
      
      setCurrentGameState(firstProcessedState);
      setStartTime(Date.now());
      setCurrentFrame(0);
      setIsPlaying(true);
      
      // Set an active snake by default (first one)
      if (firstProcessedState.snakes.length > 0) {
        setActiveSnake(firstProcessedState.snakes[0]);
      }
      
      console.log("Started playing recording with", recording.game_data.frames.length, "frames");
    } catch (error) {
      console.error("Error processing recording:", error);
    }
  };

  // Toggle play/pause
  const togglePlay = () => setIsPlaying(prevState => !prevState);

  // Select a snake
  const handleSelectSnake = (snake: Snake) => {
    console.log("Selected snake:", snake.id);
    setActiveSnake(snake);
  };

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
          
          try {
            // Process the next frame
            const processedState = processGameState(frames[nextFrame]);
            setCurrentGameState(processedState);
            
            // If we have an active snake, find the corresponding snake in the new frame
            if (activeSnake) {
              const updatedActiveSnake = processedState.snakes.find(s => s.id === activeSnake.id);
              if (updatedActiveSnake) {
                setActiveSnake(updatedActiveSnake);
              }
            }
          } catch (error) {
            console.error("Error processing frame:", error);
            setIsPlaying(false);
            return prev;
          }
          
          return nextFrame;
        });
      }, playbackSpeed);
    }
    
    return () => {
      if (frameTimer) clearInterval(frameTimer);
    };
  }, [isPlaying, currentRecording, activeSnake, playbackSpeed]);

  // Change playback speed
  const changePlaybackSpeed = (newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
  };

  return {
    isPlaying,
    currentFrame,
    currentGameState,
    activeSnake,
    startTime,
    currentRecording,
    playbackSpeed,
    togglePlay,
    handlePlayRecording,
    handleSelectSnake,
    changePlaybackSpeed,
    totalFrames: currentRecording?.game_data?.frames?.length || 0
  };
}
