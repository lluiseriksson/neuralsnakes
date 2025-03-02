
import { NodePosition, NodeValues } from './types';
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
  
  nodeValues.inputs.forEach((value, index) => {
    const y = inputStartY + (index * inputSpacing);
    const position = drawNode(
      ctx, 
      inputLayerX, 
      y, 
      value, 
      nodeValues.inputLabels[index], 
      true,
      false,
      nodeRadius
    );
    positions.push(position);
  });
  
  return positions;
};
