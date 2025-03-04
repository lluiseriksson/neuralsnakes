
import { Snake } from '../../../types';
import { roundedRect } from '../utils/shapeUtils';
import { getAdjustedColor } from '../utils/colorUtils';

/**
 * Draws the head of a snake
 */
export function drawSnakeHead(
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  cellSize: number,
  isSelected: boolean
): void {
  if (!snake.positions || snake.positions.length === 0) return;
  
  const head = snake.positions[0];
  const baseColor = snake.color;
  const lightColor = getAdjustedColor(baseColor, 50);
  
  // Highlight selected snake with a stronger glow effect
  if (isSelected) {
    ctx.save();
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 15;
    ctx.fillStyle = lightColor; // Use lighter color for selected snake head
    
    // Draw head as a rounded rectangle
    roundedRect(
      ctx,
      head.x * cellSize,
      head.y * cellSize,
      cellSize,
      cellSize,
      cellSize / 3
    );
    ctx.restore();
  } else {
    // Regular head with slightly rounded corners and border for better visibility
    ctx.fillStyle = baseColor;
    roundedRect(
      ctx,
      head.x * cellSize,
      head.y * cellSize,
      cellSize,
      cellSize,
      cellSize / 3
    );
    
    // Add highlight border
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  
  // Add a small marker to indicate snake ID
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = `bold ${cellSize / 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    `${snake.id}`, 
    head.x * cellSize + cellSize / 2, 
    head.y * cellSize + cellSize / 2
  );
}
