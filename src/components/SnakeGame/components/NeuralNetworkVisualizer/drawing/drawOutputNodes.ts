
import { NodePosition, NodeValues, OutputDrawResult, NodeStylingOptions } from './types';
import { drawNode } from './drawNode';

// Draw output nodes
export const drawOutputNodes = (
  ctx: CanvasRenderingContext2D, 
  nodeValues: NodeValues, 
  outputLayerX: number, 
  outputStartY: number, 
  outputSpacing: number,
  nodeRadius: number = 12
): OutputDrawResult => {
  const positions: NodePosition[] = [];
  
  // Find the selected (highest activation) output
  const selectedIndex = nodeValues.outputs.indexOf(Math.max(...nodeValues.outputs));
  
  // Add animation timing offset for staggered effect
  const time = Date.now() / 1000;
  
  nodeValues.outputs.forEach((value, index) => {
    // Add slight movement based on time for visual interest
    const oscillation = Math.sin(time + index * 0.5) * 2;
    const y = outputStartY + (index * outputSpacing) + oscillation;
    
    const isSelected = index === selectedIndex;
    
    // Custom styling options
    const nodeOptions: NodeStylingOptions = {
      radius: nodeRadius,
      isSelected,
      isInput: false,
      pulseEffect: true,
      glowEffect: isSelected // Make selected output glow
    };
    
    const position = drawNode(
      ctx, 
      outputLayerX, 
      y, 
      value, 
      nodeValues.outputLabels[index], 
      false,
      isSelected,
      nodeRadius,
      nodeOptions
    );
    
    positions.push(position);
  });
  
  return { positions, selectedIndex };
};
