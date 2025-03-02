
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
  nodeRadius: number = 12
): NodePosition => {
  // Add subtle position animation
  const animX = x + Math.sin(Date.now() / 1000 + (isInput ? 0 : Math.PI)) * 1;
  const animY = y + Math.cos(Date.now() / 1200 + (isInput ? Math.PI : 0)) * 1;
  
  // Get color based on activation value
  const color = getNodeColor(value, isInput);
  
  // Draw node circle with pulsating effect
  const pulseSize = isSelected ? (Math.sin(Date.now() / 300) * 0.15) + 1 : 1;
  const animatedRadius = nodeRadius * pulseSize;
  
  ctx.beginPath();
  ctx.arc(animX, animY, animatedRadius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  
  // Draw node border with glowing effect for selected nodes
  const borderWidth = isSelected ? 3 : 1;
  ctx.lineWidth = borderWidth;
  
  if (isSelected) {
    // Create glowing effect for selected nodes
    const glowIntensity = (Math.sin(Date.now() / 200) * 0.3) + 0.7;
    ctx.strokeStyle = `rgba(255, 255, 0, ${glowIntensity})`;
    
    // Add outer glow
    ctx.shadowColor = 'rgba(255, 255, 0, 0.5)';
    ctx.shadowBlur = 10 * glowIntensity;
  } else {
    ctx.strokeStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
  }
  
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow for text
  
  // Draw node label
  const labelAlign = isInput ? 'right' : 'left';
  const offset = nodeRadius + 10;
  drawNodeLabel(ctx, label, animX, animY, labelAlign, offset);
  
  // Draw node value inside the circle
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(value.toFixed(2), animX, animY + 4);
  
  return { x: animX, y: animY };
};
