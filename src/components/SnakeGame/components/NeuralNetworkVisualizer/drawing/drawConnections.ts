
import { NodePosition, NodeValues, ConnectionStyle } from './types';

// Draw connections between input and selected output nodes with animation
export const drawConnections = (
  ctx: CanvasRenderingContext2D, 
  inputPositions: NodePosition[], 
  outputPositions: NodePosition[],
  selectedOutputIndex: number,
  nodeValues: NodeValues,
  nodeRadius: number = 12
) => {
  const selectedOutput = outputPositions[selectedOutputIndex];
  
  if (!selectedOutput) return;
  
  inputPositions.forEach((inputPos, inputIndex) => {
    const inputValue = nodeValues.inputs[inputIndex];
    
    // Create connection style based on input value
    const connectionStyle: ConnectionStyle = {
      opacity: Math.max(0.1, inputValue),
      width: Math.max(0.5, inputValue * 3),
      dashPattern: [2, 3],
      flowSpeed: 300, // milliseconds per cycle
      gradient: true
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
      gradient.addColorStop(0, `rgba(150, 150, 255, ${connectionStyle.opacity})`);
      gradient.addColorStop(1, `rgba(255, 255, 150, ${connectionStyle.opacity})`);
      
      ctx.strokeStyle = gradient;
    } else {
      ctx.strokeStyle = `rgba(150, 150, 255, ${connectionStyle.opacity})`;
    }
    
    ctx.lineWidth = connectionStyle.width;
    ctx.stroke();
    
    // Reset dash for other drawings
    ctx.setLineDash([]);
  });
};
