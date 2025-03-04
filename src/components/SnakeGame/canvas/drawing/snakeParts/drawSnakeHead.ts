
import { Snake } from '../../../types';
import { roundedRect } from '../utils/shapeUtils';
import { getAdjustedColor } from '../utils/colorUtils';

/**
 * Draws the head of a snake with improved visibility
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
  const lightColor = getAdjustedColor(baseColor, 80);
  
  // Highlight selected snake with a stronger glow effect
  if (isSelected) {
    ctx.save();
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 20;
    
    // Use brighter color for selected snake head
    const glowColor = getAdjustedColor(baseColor, 100);
    ctx.fillStyle = glowColor;
    
    // Draw head as a rounded rectangle
    roundedRect(
      ctx,
      head.x * cellSize - 1,
      head.y * cellSize - 1,
      cellSize + 2,
      cellSize + 2,
      cellSize / 3
    );
    ctx.restore();
    
    // Add inner highlight
    ctx.fillStyle = lightColor;
    roundedRect(
      ctx,
      head.x * cellSize + 2,
      head.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4,
      cellSize / 4
    );
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
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  
  // Add a small marker to indicate snake ID
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Fully opaque white for better visibility
  ctx.font = `bold ${cellSize / 1.8}px Arial`; // Larger font
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add text shadow for better readability
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  
  ctx.fillText(
    `${snake.id}`, 
    head.x * cellSize + cellSize / 2, 
    head.y * cellSize + cellSize / 2
  );
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
