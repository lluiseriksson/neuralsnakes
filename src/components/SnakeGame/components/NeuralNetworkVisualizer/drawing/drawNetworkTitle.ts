
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
        snakeType = '🟡 Best Model (Yellow)';
        break;
      case 1:
        snakeType = '🔵 Combined Model (Blue)';
        break;
      default:
        snakeType = `⚪ Experimental Snake #${activeSnake.id}`;
    }
    
    const generation = typeof activeSnake.brain?.getGeneration === 'function' 
      ? activeSnake.brain.getGeneration() 
      : 0;
    
    titleText = `${snakeType} - Generation ${generation}`;
  }
  
  ctx.fillText(titleText, canvas.width / 2, 25);
  
  // Add subtitle
  ctx.font = '10px Arial';
  ctx.fillStyle = '#AAAAAA';
  ctx.fillText('Input Layer ← Decision Weights → Output Layer', canvas.width / 2, 45);
};
