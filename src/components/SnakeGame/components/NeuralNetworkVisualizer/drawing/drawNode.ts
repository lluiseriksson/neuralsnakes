
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
  nodeRadius: number = 12,
  options: NodeStylingOptions = {}
): NodePosition => {
  // Add subtle position animation
  const time = Date.now();
  const animSpeed = options.glowEffect ? 1200 : 1000;
  const animX = x + Math.sin(time / animSpeed + (isInput ? 0 : Math.PI)) * 1;
  const animY = y + Math.cos(time / (animSpeed + 200) + (isInput ? Math.PI : 0)) * 1;
  
  // Get color based on activation value and node type
  const color = getNodeColor(value, isInput);
  
  // Calculate pulsating effect
  const pulseSpeed = isSelected ? 300 : 500;
  const pulseSize = (options.pulseEffect || isSelected) 
    ? (Math.sin(time / pulseSpeed) * 0.15) + 1 
    : 1;
  const animatedRadius = nodeRadius * pulseSize;
  
  // Draw node with glow effect
  if (options.glowEffect || isSelected) {
    const glowIntensity = (Math.sin(time / 400) * 0.3) + 0.7;
    ctx.shadowColor = isInput ? 'rgba(100, 255, 100, 0.6)' : 'rgba(255, 255, 0, 0.6)';
    ctx.shadowBlur = 10 * glowIntensity;
  }
  
  // Draw node circle
  ctx.beginPath();
  ctx.arc(animX, animY, animatedRadius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  
  // Draw node border
  const borderWidth = isSelected ? 3 : 1;
  ctx.lineWidth = borderWidth;
  
  if (isSelected) {
    // Create glowing effect for selected nodes
    const glowIntensity = (Math.sin(time / 200) * 0.3) + 0.7;
    ctx.strokeStyle = `rgba(255, 255, 0, ${glowIntensity})`;
  } else if (options.glowEffect) {
    // Create subtle glow for apple inputs
    const glowIntensity = (Math.sin(time / 300) * 0.2) + 0.8;
    ctx.strokeStyle = `rgba(100, 255, 100, ${glowIntensity})`;
  } else {
    ctx.strokeStyle = '#FFFFFF';
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
