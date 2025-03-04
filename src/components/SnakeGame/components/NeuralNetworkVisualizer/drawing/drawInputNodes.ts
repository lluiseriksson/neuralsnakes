
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
  const adjustedSpacing = inputSpacing + 2;
  
  nodeValues.inputs.forEach((value, index) => {
    // Calculate y position with slight oscillation for visual appeal
    const oscillation = Math.sin(time + index * 0.3) * 1.5; // Reduced oscillation
    const y = inputStartY + (index * adjustedSpacing) + oscillation;
    
    // Move input nodes slightly to the right to make room for labels
    const adjustedX = inputLayerX + 10;
    
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
