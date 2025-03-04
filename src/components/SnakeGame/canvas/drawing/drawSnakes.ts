
import { Snake } from '../../types';
import { SnakeRenderer } from './SnakeRenderer';

/**
 * Draws all snakes on the canvas with improved visual effects
 * using the SnakeRenderer class for better organization
 */
export const drawSnakes = (
  ctx: CanvasRenderingContext2D,
  snakes: Snake[],
  cellSize: number,
  selectedSnakeId: number | null = null
): void => {
  if (!snakes || snakes.length === 0) return;

  // Create a snake renderer instance
  const snakeRenderer = new SnakeRenderer(ctx, cellSize);
  
  // Render all snakes
  snakeRenderer.renderSnakes(snakes, selectedSnakeId);
};
