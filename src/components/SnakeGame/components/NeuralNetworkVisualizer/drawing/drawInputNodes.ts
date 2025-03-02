
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
  
  nodeValues.inputs.forEach((value, index) => {
    // Calculate y position with slight oscillation for visual appeal
    const oscillation = Math.sin(time + index * 0.3) * 2;
    const y = inputStartY + (index * inputSpacing) + oscillation;
    
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
      inputLayerX, 
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
