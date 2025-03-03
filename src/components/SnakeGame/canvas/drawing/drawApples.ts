
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
  const glowSize = 1 + 0.5 * Math.sin(frameCount * 0.1); // Slower, more visible pulse
  
  apples.forEach(apple => {
    if (apple && apple.position) {
      const centerX = apple.position.x * cellSize + cellSize / 2;
      const centerY = apple.position.y * cellSize + cellSize / 2;
      const radius = cellSize / 2 * 0.85; // Slightly larger apples
      
      // Add pulsing glow effect with increased brightness
      ctx.save();
      ctx.globalAlpha = 0.7; // Increased visibility
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius * 2.0 * glowSize
      );
      gradient.addColorStop(0, 'rgba(255, 100, 100, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2.0 * glowSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Draw main apple shape with brighter colors
      ctx.save();
      const appleGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
        centerX, centerY, radius
      );
      appleGradient.addColorStop(0, '#ff9999'); // Lighter red
      appleGradient.addColorStop(1, '#ff0000'); // Bright red
      
      ctx.fillStyle = appleGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add apple stem
      ctx.fillStyle = '#996644';
      ctx.fillRect(centerX - 1.5, centerY - radius - 3, 3, 5);
      
      // Add apple highlight (changes with frame count for subtle animation)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Brighter highlight
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
      
      // Add a white border for better visibility against dark backgrounds
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // More visible border
      ctx.lineWidth = 1.5; // Thicker border
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 1, 0, Math.PI * 2);
      ctx.stroke();
      
      // Add position text for debugging (optional - commented out)
      // ctx.fillStyle = 'white';
      // ctx.font = '8px Arial';
      // ctx.textAlign = 'center';
      // ctx.fillText(`${apple.position.x},${apple.position.y}`, centerX, centerY + radius + 10);
    }
  });
};
