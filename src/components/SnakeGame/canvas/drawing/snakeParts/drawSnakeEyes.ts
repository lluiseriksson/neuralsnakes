
import { Snake } from '../../../types';
import { drawCircle } from '../utils/shapeUtils';

/**
 * Draws the eyes on a snake's head with improved visibility
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
  const eyeSize = cellSize / 4; // Larger eyes
  const eyeOffset = cellSize / 3.5;
  
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
  
  // Draw white part of the eyes (sclera)
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  
  // Add glow effect
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
  ctx.shadowBlur = 4;
  
  drawCircle(ctx, eyeX1 + eyeSize/2, eyeY1 + eyeSize/2, eyeSize/2);
  ctx.stroke();
  
  drawCircle(ctx, eyeX2 + eyeSize/2, eyeY2 + eyeSize/2, eyeSize/2);
  ctx.stroke();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Draw pupils (black dots in the eyes)
  ctx.fillStyle = 'black';
  
  // Adjust pupil position based on direction to create a more focused look
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;
  
  switch (snake.direction) {
    case 'UP':
      pupilOffsetY = -1;
      break;
    case 'DOWN':
      pupilOffsetY = 1;
      break;
    case 'LEFT':
      pupilOffsetX = -1;
      break;
    case 'RIGHT':
      pupilOffsetX = 1;
      break;
  }
  
  drawCircle(ctx, eyeX1 + eyeSize/2 + pupilOffsetX, eyeY1 + eyeSize/2 + pupilOffsetY, eyeSize/3);
  drawCircle(ctx, eyeX2 + eyeSize/2 + pupilOffsetX, eyeY2 + eyeSize/2 + pupilOffsetY, eyeSize/3);
  
  // Add eye highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  drawCircle(ctx, eyeX1 + eyeSize/2 - eyeSize/5, eyeY1 + eyeSize/2 - eyeSize/5, eyeSize/6);
  drawCircle(ctx, eyeX2 + eyeSize/2 - eyeSize/5, eyeY2 + eyeSize/2 - eyeSize/5, eyeSize/6);
}
