
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
  nodeRadius: number = 15
) => {
  const selectedOutput = outputPositions[selectedOutputIndex];
  
  if (!selectedOutput) return;
  
  // Custom styling based on snake type
  const getSnakeConnectionStyle = (): Partial<ConnectionStyle> => {
    switch (activeSnake.id) {
      case 0: // Yellow snake (best model)
        return { 
          dashPattern: [2, 3],
          flowSpeed: 150,
          gradient: true,
          colorStart: 'rgba(255, 221, 0, 0.9)',
          colorEnd: 'rgba(255, 255, 150, 0.9)' 
        };
      case 1: // Blue snake (combined model)
        return { 
          dashPattern: [3, 2],
          flowSpeed: 200,
          gradient: true,
          colorStart: 'rgba(20, 120, 255, 0.9)',
          colorEnd: 'rgba(100, 200, 255, 0.9)'
        };
      default: // Other experimental snakes
        return { 
          dashPattern: [2, 4],
          flowSpeed: 250,
          gradient: true,
          colorStart: 'rgba(180, 180, 255, 0.8)',
          colorEnd: 'rgba(255, 255, 180, 0.8)'
        };
    }
  };
  
  const snakeStyle = getSnakeConnectionStyle();
  
  // Add glow effect for connections
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
  ctx.shadowBlur = 5;
  
  inputPositions.forEach((inputPos, inputIndex) => {
    const inputValue = nodeValues.inputs[inputIndex];
    
    // Only draw connections for significant inputs (reduced threshold for better visibility)
    if (Math.abs(inputValue) < 0.02) return;
    
    // Create connection style based on input value
    const connectionStyle: ConnectionStyle = {
      opacity: Math.max(0.2, Math.abs(inputValue)),
      width: Math.max(1.5, Math.abs(inputValue) * 4), // Thicker lines
      dashPattern: snakeStyle.dashPattern || [2, 3],
      flowSpeed: snakeStyle.flowSpeed || 200, // Faster animation
      gradient: true,
      // Negative values get bright red colors
      colorStart: inputValue < 0 ? 'rgba(255, 80, 80, 0.9)' : (snakeStyle.colorStart || 'rgba(150, 150, 255, 0.9)'),
      colorEnd: inputValue < 0 ? 'rgba(255, 120, 80, 0.9)' : (snakeStyle.colorEnd || 'rgba(255, 255, 150, 0.9)')
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
  
  // Reset shadow
  ctx.shadowBlur = 0;
};
