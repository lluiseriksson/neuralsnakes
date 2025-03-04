
import { Snake } from '../../../types';
import { roundedRect } from '../utils/shapeUtils';
import { getAdjustedColor } from '../utils/colorUtils';

/**
 * Draws the body segments of a snake
 */
export function drawSnakeBody(
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  cellSize: number
): void {
  if (!snake.positions || snake.positions.length <= 1) return;
  
  // Get snake colors
  const baseColor = snake.color;
  const darkColor = getAdjustedColor(baseColor, -30); // darker version for shading
  const lightColor = getAdjustedColor(baseColor, 50); // lighter version for highlights
  
  // Draw segments from tail to head (excluding head)
  for (let i = snake.positions.length - 1; i > 0; i--) {
    const segment = snake.positions[i];
    
    // Alternate colors for segments to create a pattern
    ctx.fillStyle = i % 2 === 0 ? baseColor : darkColor;
    
    // Draw rounded segments for a smoother look
    const x = segment.x * cellSize;
    const y = segment.y * cellSize;
    
    // Rounded rectangle for body segments
    roundedRect(
      ctx,
      x + 1,
      y + 1,
      cellSize - 2,
      cellSize - 2,
      cellSize / 5
    );
    
    // Add highlight edge on body segments for better visibility
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
