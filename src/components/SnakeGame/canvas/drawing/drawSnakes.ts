
import { Snake } from '../../types';

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
    
    // Draw snake body with gradient effect based on snake color
    const baseColor = snake.color;
    const darkColor = getAdjustedColor(baseColor, -30); // darker version for shading
    
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
    }
    
    // Draw snake head with special styling
    const head = snake.positions[0];
    
    // Highlight selected snake with a glow effect
    if (isSelected) {
      ctx.save();
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 15;
      ctx.fillStyle = baseColor;
      
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
      // Regular head with slightly rounded corners
      ctx.fillStyle = baseColor;
      roundedRect(
        ctx,
        head.x * cellSize,
        head.y * cellSize,
        cellSize,
        cellSize,
        cellSize / 3
      );
    }
    
    // Draw eyes on snake head
    ctx.fillStyle = 'white';
    
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
    drawCircle(ctx, eyeX1 + eyeSize/2, eyeY1 + eyeSize/2, eyeSize/2);
    drawCircle(ctx, eyeX2 + eyeSize/2, eyeY2 + eyeSize/2, eyeSize/2);
    
    // Draw pupils (black dots in the eyes)
    ctx.fillStyle = 'black';
    drawCircle(ctx, eyeX1 + eyeSize/2, eyeY1 + eyeSize/2, eyeSize/4);
    drawCircle(ctx, eyeX2 + eyeSize/2, eyeY2 + eyeSize/2, eyeSize/4);
    
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
  });
};

/**
 * Helper function to draw a rounded rectangle
 */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Helper function to draw a circle
 */
function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Helper function to adjust color brightness
 */
function getAdjustedColor(hex: string, amount: number): string {
  // Handle named colors
  if (hex === 'blue') hex = '#0000FF';
  if (hex === 'green') hex = '#00FF00';
  
  // Parse the hex color
  let r = 0, g = 0, b = 0;
  
  // Check if it's a hex color
  if (hex.startsWith('#')) {
    const cleaned = hex.substring(1);
    if (cleaned.length === 3) {
      r = parseInt(cleaned[0] + cleaned[0], 16);
      g = parseInt(cleaned[1] + cleaned[1], 16);
      b = parseInt(cleaned[2] + cleaned[2], 16);
    } else if (cleaned.length === 6) {
      r = parseInt(cleaned.substring(0, 2), 16);
      g = parseInt(cleaned.substring(2, 4), 16);
      b = parseInt(cleaned.substring(4, 6), 16);
    }
  } else {
    // Default to a gray color if parsing fails
    r = g = b = 128;
  }
  
  // Adjust color
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
