
import { NodeValues, NodePosition } from './types';
import { drawNetworkTitle } from './drawNetworkTitle';
import { drawInputNodes } from './drawInputNodes';
import { drawOutputNodes } from './drawOutputNodes';
import { drawConnections } from './drawConnections';

// Main function that draws the entire neural network visualization
export const drawNetworkNodes = (
  ctx: CanvasRenderingContext2D, 
  nodeValues: NodeValues, 
  canvas: HTMLCanvasElement,
  activeSnake: any
) => {
  // Set up layout parameters
  const inputLayerX = 150;  // Further increased from 120 to ensure labels are fully visible
  const outputLayerX = canvas.width - 100;
  const inputStartY = 60;
  const outputStartY = 80;
  const nodeRadius = 12;
  const inputSpacing = 30;
  const outputSpacing = 40;
  
  // Request animation frame for continuous updates
  requestAnimationFrame(() => {
    drawNetworkTitle(ctx, canvas);
    
    // Draw input nodes and get their positions
    const inputPositions = drawInputNodes(
      ctx, nodeValues, inputLayerX, inputStartY, inputSpacing, nodeRadius
    );
    
    // Draw output nodes and get their positions + selected index
    const { positions: outputPositions, selectedIndex } = drawOutputNodes(
      ctx, nodeValues, outputLayerX, outputStartY, outputSpacing, nodeRadius
    );
    
    // Draw connections between input nodes and selected output
    drawConnections(
      ctx, inputPositions, outputPositions, selectedIndex, nodeValues, nodeRadius
    );
  });
};
