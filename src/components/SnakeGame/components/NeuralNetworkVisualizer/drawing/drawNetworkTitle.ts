
import { Snake } from '../../../types';

// Draw the network visualization title
export const drawNetworkTitle = (
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement,
  activeSnake?: Snake
) => {
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  
  // Add snake type information if available
  let titleText = 'Neural Network Visualization';
  
  if (activeSnake) {
    let snakeType = '';
    
    switch (activeSnake.id) {
      case 0:
        snakeType = '🟡 Yellow Snake (Best Model)';
        break;
      case 1:
        snakeType = '🔵 Blue Snake (Combined)';
        break;
      case 2:
        snakeType = '🟢 Green Snake (Experimental)';
        break;
      case 3:
        snakeType = '🟣 Purple Snake (Experimental)';
        break;
      default:
        snakeType = `⚪ Snake #${activeSnake.id} (Experimental)`;
    }
    
    // IMPORTANT: Get generation with priority order: brain function, snake property, fallback
    let generation;
    if (typeof activeSnake.brain?.getGeneration === 'function') {
      try {
        generation = activeSnake.brain.getGeneration();
      } catch (error) {
        console.error("Error getting generation from brain in title:", error);
        generation = activeSnake.generation || 0;
      }
    } else {
      generation = activeSnake.generation || 0;
    }
    
    titleText = `${snakeType} - Generation ${generation}`;
  }
  
  ctx.fillText(titleText, canvas.width / 2, 25);
  
  // Add subtitle
  ctx.font = '10px Arial';
  ctx.fillStyle = '#AAAAAA';
  ctx.fillText('Input Layer ← Decision Weights → Output Layer', canvas.width / 2, 45);
};
