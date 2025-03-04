
import { Snake } from '../../types';
import { drawSnakeBody } from './snakeParts/drawSnakeBody';
import { drawSnakeHead } from './snakeParts/drawSnakeHead';
import { drawSnakeEyes } from './snakeParts/drawSnakeEyes';

/**
 * Draws all snakes on the canvas with improved visual effects
 */
export const drawSnakes = (
  ctx: CanvasRenderingContext2D,
  snakes: Snake[],
  cellSize: number,
  selectedSnakeId: number | null = null
): void => {
  if (!snakes || snakes.length === 0) return;

  snakes.forEach(snake => {
    if (!snake.alive || !snake.positions || snake.positions.length === 0) return;

    const isSelected = selectedSnakeId !== null && snake.id === selectedSnakeId;
    
    // Draw snake body
    drawSnakeBody(ctx, snake, cellSize);
    
    // Draw snake head
    drawSnakeHead(ctx, snake, cellSize, isSelected);
    
    // Draw snake eyes
    drawSnakeEyes(ctx, snake, cellSize);
  });
};
