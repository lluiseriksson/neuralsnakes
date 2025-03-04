
import { LearningEvent } from './types';

export const drawLearningHistory = (
  ctx: CanvasRenderingContext2D, 
  learningEvents: LearningEvent[],
  canvas: HTMLCanvasElement
) => {
  // We're no longer drawing this in the canvas, as we've created a separate component
  // This function is kept for compatibility but doesn't do anything anymore
  return;
};
