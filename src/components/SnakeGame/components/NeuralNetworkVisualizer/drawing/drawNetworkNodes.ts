
import { NodeValues, NodePosition, CanvasLayout } from './types';
import { drawNetworkTitle } from './drawNetworkTitle';
import { drawInputNodes } from './drawInputNodes';
import { drawOutputNodes } from './drawOutputNodes';
import { drawConnections } from './drawConnections';
import { Snake } from '../../../types';

// Main function that draws the entire neural network visualization
export const drawNetworkNodes = (
  ctx: CanvasRenderingContext2D, 
  nodeValues: NodeValues, 
  canvas: HTMLCanvasElement,
  activeSnake: Snake
) => {
  // Set up layout parameters
  const layout: CanvasLayout = {
    width: canvas.width,
    height: canvas.height,
    inputLayerX: 150,  // Increased to ensure labels are fully visible
    outputLayerX: canvas.width - 100,
    inputStartY: 60,
    outputStartY: 80,
    nodeRadius: 12,
    inputSpacing: 30,
    outputSpacing: 40
  };
  
  // Draw network title with snake information
  drawNetworkTitle(ctx, canvas, activeSnake);
  
  // Draw input nodes and get their positions
  const inputPositions = drawInputNodes(
    ctx, nodeValues, layout.inputLayerX, layout.inputStartY, layout.inputSpacing, layout.nodeRadius
  );
  
  // Draw output nodes and get their positions + selected index
  const { positions: outputPositions, selectedIndex } = drawOutputNodes(
    ctx, nodeValues, layout.outputLayerX, layout.outputStartY, layout.outputSpacing, layout.nodeRadius
  );
  
  // Draw connections between input nodes and selected output
  drawConnections(
    ctx, inputPositions, outputPositions, selectedIndex, nodeValues, activeSnake, layout.nodeRadius
  );
};
