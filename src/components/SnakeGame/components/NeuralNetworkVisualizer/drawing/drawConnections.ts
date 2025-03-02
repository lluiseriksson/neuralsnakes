
import { NodePosition, NodeValues } from './types';

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
    
    // Draw line with opacity based on input strength and animated flow
    const opacity = Math.max(0.1, inputValue);
    const flowOffset = (Date.now() / 300) % 20; // Creates the flowing effect
    
    // Create dashed line effect for animation
    ctx.beginPath();
    ctx.setLineDash([2, 3]);
    ctx.lineDashOffset = -flowOffset; // Negative to make it flow toward output
    
    ctx.moveTo(inputPos.x + nodeRadius, inputPos.y);
    ctx.lineTo(selectedOutput.x - nodeRadius, selectedOutput.y);
    
    // Gradient effect to show direction
    const gradient = ctx.createLinearGradient(
      inputPos.x + nodeRadius, inputPos.y, 
      selectedOutput.x - nodeRadius, selectedOutput.y
    );
    gradient.addColorStop(0, `rgba(150, 150, 255, ${opacity})`);
    gradient.addColorStop(1, `rgba(255, 255, 150, ${opacity})`);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(0.5, inputValue * 3);
    ctx.stroke();
    
    // Reset dash for other drawings
    ctx.setLineDash([]);
  });
};
