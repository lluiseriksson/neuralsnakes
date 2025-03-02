
import { NodePosition, NodeValues, ConnectionStyle } from './types';
import { Snake } from '../../../types';

// Draw connections between input and selected output nodes with animation
export const drawConnections = (
  ctx: CanvasRenderingContext2D, 
  inputPositions: NodePosition[], 
  outputPositions: NodePosition[],
  selectedOutputIndex: number,
  nodeValues: NodeValues,
  activeSnake: Snake,
  nodeRadius: number = 12
) => {
  const selectedOutput = outputPositions[selectedOutputIndex];
  
  if (!selectedOutput) return;
  
  // Custom styling based on snake type
  const getSnakeConnectionStyle = (): Partial<ConnectionStyle> => {
    switch (activeSnake.id) {
      case 0: // Yellow snake (best model)
        return { 
          dashPattern: [1, 2],
          flowSpeed: 200,
          gradient: true,
          colorStart: 'rgba(255, 221, 0, 0.7)',
          colorEnd: 'rgba(255, 255, 150, 0.8)' 
        };
      case 1: // Blue snake (combined model)
        return { 
          dashPattern: [2, 1],
          flowSpeed: 250,
          gradient: true,
          colorStart: 'rgba(0, 100, 255, 0.7)',
          colorEnd: 'rgba(100, 200, 255, 0.8)'
        };
      default: // Other experimental snakes
        return { 
          dashPattern: [2, 3],
          flowSpeed: 300,
          gradient: true,
          colorStart: 'rgba(150, 150, 255, 0.5)',
          colorEnd: 'rgba(255, 255, 150, 0.6)'
        };
    }
  };
  
  const snakeStyle = getSnakeConnectionStyle();
  
  inputPositions.forEach((inputPos, inputIndex) => {
    const inputValue = nodeValues.inputs[inputIndex];
    
    // Only draw connections for significant inputs
    if (Math.abs(inputValue) < 0.05) return;
    
    // Create connection style based on input value
    const connectionStyle: ConnectionStyle = {
      opacity: Math.max(0.1, Math.abs(inputValue)),
      width: Math.max(0.5, Math.abs(inputValue) * 3),
      dashPattern: snakeStyle.dashPattern || [2, 3],
      flowSpeed: snakeStyle.flowSpeed || 300,
      gradient: true,
      // Negative values get different colors (red-ish)
      colorStart: inputValue < 0 ? 'rgba(255, 100, 100, 0.6)' : (snakeStyle.colorStart || 'rgba(150, 150, 255, 0.6)'),
      colorEnd: inputValue < 0 ? 'rgba(255, 150, 100, 0.7)' : (snakeStyle.colorEnd || 'rgba(255, 255, 150, 0.7)')
    };
    
    // Draw line with opacity based on input strength and animated flow
    const flowOffset = (Date.now() / connectionStyle.flowSpeed) % 20; // Creates the flowing effect
    
    // Create dashed line effect for animation
    ctx.beginPath();
    ctx.setLineDash(connectionStyle.dashPattern);
    ctx.lineDashOffset = -flowOffset; // Negative to make it flow toward output
    
    ctx.moveTo(inputPos.x + nodeRadius, inputPos.y);
    ctx.lineTo(selectedOutput.x - nodeRadius, selectedOutput.y);
    
    // Gradient effect to show direction
    if (connectionStyle.gradient) {
      const gradient = ctx.createLinearGradient(
        inputPos.x + nodeRadius, inputPos.y, 
        selectedOutput.x - nodeRadius, selectedOutput.y
      );
      gradient.addColorStop(0, connectionStyle.colorStart);
      gradient.addColorStop(1, connectionStyle.colorEnd);
      
      ctx.strokeStyle = gradient;
    } else {
      ctx.strokeStyle = connectionStyle.colorStart;
    }
    
    ctx.lineWidth = connectionStyle.width;
    ctx.stroke();
    
    // Reset dash for other drawings
    ctx.setLineDash([]);
  });
};
