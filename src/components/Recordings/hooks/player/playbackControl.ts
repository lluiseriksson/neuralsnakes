
import { GameState, Snake } from "../../../SnakeGame/types";

/**
 * Handles the timer and playback control for recording playback
 */
export const startPlaybackTimer = (
  frames: GameState[],
  activeSnake: Snake | null,
  currentFrame: number,
  speed: number,
  setCurrentFrame: (index: number) => void,
  setCurrentGameState: (state: GameState) => void,
  setActiveSnake: (snake: Snake | null) => void,
  setIsPlaying: (isPlaying: boolean) => void,
  cleanup: () => void
): number | null => {
  cleanup();
  
  if (!frames || frames.length <= 1) return null;
  
  return window.setInterval(() => {
    const nextFrame = currentFrame + 1;
    
    if (nextFrame >= frames.length) {
      setIsPlaying(false);
      cleanup();
      return; // End playback
    }
    
    try {
      // Process the next frame
      const processedState = frames[nextFrame];
      setCurrentGameState(processedState);
      setCurrentFrame(nextFrame);
      
      // If we have an active snake, find the corresponding one in the new frame
      if (activeSnake && processedState.snakes) {
        const updatedActiveSnake = processedState.snakes.find(s => s.id === activeSnake.id);
        if (updatedActiveSnake) {
          setActiveSnake(updatedActiveSnake);
        }
      }
    } catch (error) {
      console.error("Error processing frame:", error);
      setIsPlaying(false);
      cleanup();
    }
  }, speed);
};

/**
 * Changes the playback speed and restarts playback if active
 */
export const changePlaybackSpeed = (
  newSpeed: number,
  isPlaying: boolean,
  frames: GameState[],
  activeSnake: Snake | null, 
  currentFrame: number,
  setPlaybackSpeed: (speed: number) => void,
  setCurrentFrame: (index: number) => void,
  setCurrentGameState: (state: GameState) => void,
  setActiveSnake: (snake: Snake | null) => void,
  setIsPlaying: (isPlaying: boolean) => void,
  cleanup: () => void
): void => {
  setPlaybackSpeed(newSpeed);
  
  // Restart the timer with the new speed
  if (isPlaying) {
    cleanup();
    startPlaybackTimer(
      frames,
      activeSnake,
      currentFrame,
      newSpeed,
      setCurrentFrame,
      setCurrentGameState,
      setActiveSnake,
      setIsPlaying,
      cleanup
    );
  }
};
