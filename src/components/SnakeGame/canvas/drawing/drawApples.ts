
import { Apple } from '../../types';

/**
 * Draw apples with highlight effect and improved visibility
 */
export const drawApples = (
  ctx: CanvasRenderingContext2D, 
  apples: Apple[], 
  frameCount: number, 
  cellSize: number
): void => {
  if (!apples || apples.length === 0) return;
  
  // Draw glow effect for apples
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#ff6666';
  
  apples.forEach(apple => {
    if (apple && apple.position) {
      ctx.beginPath();
      ctx.arc(
        apple.position.x * cellSize + cellSize / 2,
        apple.position.y * cellSize + cellSize / 2,
        cellSize / 1.5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  });
  
  ctx.restore();
  
  // Draw main apple shape
  ctx.fillStyle = '#ff0000';
  apples.forEach(apple => {
    if (apple && apple.position) {
      ctx.beginPath();
      ctx.arc(
        apple.position.x * cellSize + cellSize / 2,
        apple.position.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  });

  // Apple highlight effect that changes with frame count
  if (frameCount % 3 === 0) {
    ctx.fillStyle = '#ff6666';
    apples.forEach(apple => {
      if (apple && apple.position) {
        ctx.beginPath();
        ctx.arc(
          apple.position.x * cellSize + cellSize / 3,
          apple.position.y * cellSize + cellSize / 3,
          2,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });
  }
};
