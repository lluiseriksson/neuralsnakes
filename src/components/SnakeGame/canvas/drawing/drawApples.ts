
import { Apple } from '../../types';

/**
 * Draw apples with enhanced visual effects for better visibility
 * Type B apples (from collisions) will have a distinct appearance but same color
 */
export const drawApples = (
  ctx: CanvasRenderingContext2D, 
  apples: Apple[], 
  frameCount: number, 
  cellSize: number
): void => {
  if (!apples || apples.length === 0) return;
  
  // Draw glow effect for apples that pulses with the frame count
  const glowSize = 1 + 0.8 * Math.sin(frameCount * 0.1); // Stronger, more visible pulse
  
  apples.forEach((apple, index) => {
    if (apple && apple.position) {
      const centerX = apple.position.x * cellSize + cellSize / 2;
      const centerY = apple.position.y * cellSize + cellSize / 2;
      const radius = cellSize / 2 * 0.9; // Larger apples
      
      // Determine if this is a regular apple or a collision apple (Type B)
      // Type B apples are from more recent collisions (later in the array)
      const isCollisionApple = index >= apples.length - 10; // Assume newest apples are from collisions
      
      // Add pulsing glow effect with increased brightness
      ctx.save();
      ctx.globalAlpha = 0.9; // Increased visibility
      
      // Both apple types are red now, but collision apples have slightly different appearance
      let glowColor1 = 'rgba(255, 50, 50, 0.9)';
      let glowColor2 = 'rgba(255, 0, 0, 0)';
      let appleColor1 = '#ff9999'; // Lighter red
      let appleColor2 = '#ea384c'; // Bright red (using suggested color)
      let stemColor = '#996644';
      let highlightColor = 'rgba(255, 255, 255, 0.9)';
      
      // Type B apples have a slightly different brightness/pulsing
      if (isCollisionApple) {
        appleColor1 = '#ff7777'; // Slightly different lighter red
        appleColor2 = '#ea384c'; // Same bright red
        stemColor = '#8B4513'; // Darker brown stem
      }
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.5,
        centerX, centerY, radius * 2.5 * glowSize
      );
      gradient.addColorStop(0, glowColor1);
      gradient.addColorStop(1, glowColor2);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2.5 * glowSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Draw main apple shape with brighter colors
      ctx.save();
      const appleGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1,
        centerX, centerY, radius
      );
      appleGradient.addColorStop(0, appleColor1);
      appleGradient.addColorStop(1, appleColor2);
      
      ctx.fillStyle = appleGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add apple stem
      ctx.fillStyle = stemColor;
      ctx.fillRect(centerX - 2, centerY - radius - 4, 4, 6);
      
      // Add apple highlight (changes with frame count for subtle animation)
      ctx.fillStyle = highlightColor;
      ctx.beginPath();
      ctx.arc(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
      
      // Add a white border for better visibility against dark backgrounds
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2; // Thicker border
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 1, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
};
