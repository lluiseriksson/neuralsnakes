
import { GameState, Snake } from "../../../SnakeGame/types";
import { processGameState } from "./brainProcessing";

/**
 * Handles the processing and management of recording frames
 */
export const prepareFrames = (frames: GameState[]): GameState[] => {
  if (!frames || frames.length === 0) {
    console.error("No valid frames to process");
    return [];
  }
  
  // Process all frames
  return frames.map(processGameState);
};

/**
 * Seek to a specific frame in the recording
 */
export const seekToFrame = (
  frameIndex: number,
  frames: GameState[],
  activeSnake: Snake | null,
  setCurrentFrame: (index: number) => void,
  setCurrentGameState: (state: GameState) => void,
  setActiveSnake: (snake: Snake | null) => void
): void => {
  if (frameIndex < 0 || !frames || frameIndex >= frames.length) {
    return;
  }
  
  setCurrentFrame(frameIndex);
  const targetFrame = frames[frameIndex];
  setCurrentGameState(targetFrame);
  
  // If we have an active snake, find the corresponding one in the new frame
  if (activeSnake && targetFrame.snakes) {
    const updatedActiveSnake = targetFrame.snakes.find(s => s.id === activeSnake.id);
    if (updatedActiveSnake) {
      setActiveSnake(updatedActiveSnake);
    }
  }
};
