
import { NodePosition, NodeValues, OutputDrawResult } from './types';
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
  
  nodeValues.outputs.forEach((value, index) => {
    const y = outputStartY + (index * outputSpacing);
    const isSelected = index === selectedIndex;
    
    const position = drawNode(
      ctx, 
      outputLayerX, 
      y, 
      value, 
      nodeValues.outputLabels[index], 
      false,
      isSelected,
      nodeRadius
    );
    
    positions.push(position);
  });
  
  return { positions, selectedIndex };
};
