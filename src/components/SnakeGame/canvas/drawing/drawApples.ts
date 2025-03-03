
import { Apple } from '../../types';

/**
 * Draw apples with enhanced visual effects
 */
export const drawApples = (
  ctx: CanvasRenderingContext2D, 
  apples: Apple[], 
  frameCount: number, 
  cellSize: number
): void => {
  if (!apples || apples.length === 0) return;
  
  // Draw glow effect for apples that pulses with the frame count
  const glowSize = 1 + 0.2 * Math.sin(frameCount * 0.2);
  
  apples.forEach(apple => {
    if (apple && apple.position) {
      const centerX = apple.position.x * cellSize + cellSize / 2;
      const centerY = apple.position.y * cellSize + cellSize / 2;
      const radius = cellSize / 2 * 0.8;
      
      // Add pulsing glow effect
      ctx.save();
      ctx.globalAlpha = 0.3;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius * 1.5 * glowSize
      );
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.7)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5 * glowSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Draw main apple shape
      ctx.save();
      const appleGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
        centerX, centerY, radius
      );
      appleGradient.addColorStop(0, '#ff5555');
      appleGradient.addColorStop(1, '#cc0000');
      
      ctx.fillStyle = appleGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add apple stem
      ctx.fillStyle = '#663300';
      ctx.fillRect(centerX - 1, centerY - radius - 2, 2, 4);
      
      // Add apple highlight (changes with frame count for subtle animation)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }
  });
};
