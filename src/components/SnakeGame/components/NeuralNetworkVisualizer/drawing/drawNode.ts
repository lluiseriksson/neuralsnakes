
import { NodePosition, NodeStylingOptions } from './types';
import { getNodeColor } from './nodeStyles';
import { drawNodeLabel } from './drawNodeLabel';

// Draw a single node (input or output) with animation
export const drawNode = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  value: number, 
  label: string, 
  isInput: boolean,
  isSelected: boolean = false,
  nodeRadius: number = 15, // Larger nodes
  options: NodeStylingOptions = {}
): NodePosition => {
  // Add subtle position animation
  const time = Date.now();
  const animSpeed = options.glowEffect ? 1200 : 1000;
  const animX = x + Math.sin(time / animSpeed + (isInput ? 0 : Math.PI)) * 1.5;
  const animY = y + Math.cos(time / (animSpeed + 200) + (isInput ? Math.PI : 0)) * 1.5;
  
  // Get color based on activation value and node type
  const color = getNodeColor(value, isInput);
  
  // Calculate pulsating effect
  const pulseSpeed = isSelected ? 300 : 500;
  const pulseSize = (options.pulseEffect || isSelected) 
    ? (Math.sin(time / pulseSpeed) * 0.2) + 1 
    : 1;
  const animatedRadius = nodeRadius * pulseSize;
  
  // Draw node with glow effect
  if (options.glowEffect || isSelected) {
    const glowIntensity = (Math.sin(time / 400) * 0.3) + 0.8;
    ctx.shadowColor = isInput ? 'rgba(100, 255, 100, 0.8)' : 'rgba(255, 255, 0, 0.8)';
    ctx.shadowBlur = 15 * glowIntensity;
  }
  
  // Draw node circle with 3D effect
  const gradient = ctx.createRadialGradient(
    animX - animatedRadius * 0.3, animY - animatedRadius * 0.3, 0,
    animX, animY, animatedRadius
  );
  
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, isInput ? 
    `rgba(${isInput && value < 0 ? '180,40,40' : '40,150,40'}, 1)` : 
    'rgba(80,80,180, 1)'
  );
  
  ctx.beginPath();
  ctx.arc(animX, animY, animatedRadius, 0, 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Draw node border
  const borderWidth = isSelected ? 3 : 2;
  ctx.lineWidth = borderWidth;
  
  if (isSelected) {
    // Create glowing effect for selected nodes
    const glowIntensity = (Math.sin(time / 200) * 0.3) + 0.7;
    ctx.strokeStyle = `rgba(255, 255, 100, ${glowIntensity})`;
  } else if (options.glowEffect) {
    // Create subtle glow for apple inputs
    const glowIntensity = (Math.sin(time / 300) * 0.2) + 0.9;
    ctx.strokeStyle = `rgba(120, 255, 120, ${glowIntensity})`;
  } else {
    ctx.strokeStyle = '#FFFFFF';
  }
  
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow for text
  
  // Draw node label
  const labelAlign = isInput ? 'right' : 'left';
  const offset = nodeRadius + 10;
  drawNodeLabel(ctx, label, animX, animY, labelAlign, offset);
  
  // Draw node value inside the circle with better contrast
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  
  // Add text shadow for better readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  
  ctx.fillText(value.toFixed(2), animX, animY + 4);
  
  // Reset shadow
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  return { x: animX, y: animY };
};
