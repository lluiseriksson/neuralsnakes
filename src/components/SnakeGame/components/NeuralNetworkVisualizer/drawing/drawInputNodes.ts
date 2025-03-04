
import { NodePosition, NodeValues, NodeStylingOptions } from './types';
import { drawNode } from './drawNode';

// Draw input nodes
export const drawInputNodes = (
  ctx: CanvasRenderingContext2D, 
  nodeValues: NodeValues, 
  inputLayerX: number, 
  inputStartY: number, 
  inputSpacing: number,
  nodeRadius: number = 12
): NodePosition[] => {
  const positions: NodePosition[] = [];
  
  // Add a slight staggered animation effect
  const time = Date.now() / 1000;
  
  // Increase space between inputs for better readability
  const adjustedSpacing = inputSpacing + 4; // Increased spacing even more
  
  // Push the entire input column further to the right to make room for labels
  const labelOffset = 20; // Additional space for labels
  
  nodeValues.inputs.forEach((value, index) => {
    // Calculate y position with slight oscillation for visual appeal
    const oscillation = Math.sin(time + index * 0.3) * 1.5; // Reduced oscillation
    const y = inputStartY + (index * adjustedSpacing) + oscillation;
    
    // Move input nodes significantly to the right to make room for labels
    const adjustedX = inputLayerX + labelOffset;
    
    // Custom styling for input nodes
    const nodeOptions: NodeStylingOptions = {
      radius: nodeRadius,
      isInput: true,
      pulseEffect: true,
      // Special styling for certain input types
      glowEffect: index < 4  // Make apple inputs glow
    };
    
    const position = drawNode(
      ctx, 
      adjustedX, 
      y, 
      value, 
      nodeValues.inputLabels[index], 
      true,  // isInput
      false, // isSelected
      nodeRadius,
      nodeOptions
    );
    
    positions.push(position);
  });
  
  return positions;
};
