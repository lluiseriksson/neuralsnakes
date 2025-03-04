
import { Snake } from '../../../types';
import { drawCircle } from '../utils/shapeUtils';

/**
 * Draws the eyes on a snake's head
 */
export function drawSnakeEyes(
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  cellSize: number
): void {
  if (!snake.positions || snake.positions.length === 0) return;
  
  const head = snake.positions[0];
  
  // Position eyes based on direction
  let eyeX1 = 0, eyeY1 = 0, eyeX2 = 0, eyeY2 = 0;
  const eyeSize = cellSize / 5;
  const eyeOffset = cellSize / 4;
  
  switch (snake.direction) {
    case 'UP':
      eyeX1 = head.x * cellSize + eyeOffset;
      eyeY1 = head.y * cellSize + eyeOffset;
      eyeX2 = head.x * cellSize + cellSize - eyeOffset - eyeSize;
      eyeY2 = head.y * cellSize + eyeOffset;
      break;
    case 'DOWN':
      eyeX1 = head.x * cellSize + eyeOffset;
      eyeY1 = head.y * cellSize + cellSize - eyeOffset - eyeSize;
      eyeX2 = head.x * cellSize + cellSize - eyeOffset - eyeSize;
      eyeY2 = head.y * cellSize + cellSize - eyeOffset - eyeSize;
      break;
    case 'LEFT':
      eyeX1 = head.x * cellSize + eyeOffset;
      eyeY1 = head.y * cellSize + eyeOffset;
      eyeX2 = head.x * cellSize + eyeOffset;
      eyeY2 = head.y * cellSize + cellSize - eyeOffset - eyeSize;
      break;
    case 'RIGHT':
      eyeX1 = head.x * cellSize + cellSize - eyeOffset - eyeSize;
      eyeY1 = head.y * cellSize + eyeOffset;
      eyeX2 = head.x * cellSize + cellSize - eyeOffset - eyeSize;
      eyeY2 = head.y * cellSize + cellSize - eyeOffset - eyeSize;
      break;
  }
  
  // Draw the eyes as circles for better appearance
  ctx.fillStyle = 'white';
  drawCircle(ctx, eyeX1 + eyeSize/2, eyeY1 + eyeSize/2, eyeSize/2);
  drawCircle(ctx, eyeX2 + eyeSize/2, eyeY2 + eyeSize/2, eyeSize/2);
  
  // Draw pupils (black dots in the eyes)
  ctx.fillStyle = 'black';
  drawCircle(ctx, eyeX1 + eyeSize/2, eyeY1 + eyeSize/2, eyeSize/4);
  drawCircle(ctx, eyeX2 + eyeSize/2, eyeY2 + eyeSize/2, eyeSize/4);
}
