
interface NodeValues {
  inputs: number[];
  outputs: number[];
  inputLabels: string[];
  outputLabels: string[];
}

export const drawNetworkNodes = (
  ctx: CanvasRenderingContext2D, 
  nodeValues: NodeValues, 
  canvas: HTMLCanvasElement,
  activeSnake: any
) => {
  // Calculate positions - Improved spacing for better visibility
  const inputLayerX = 150;  // Further increased from 120 to ensure labels are fully visible
  const outputLayerX = canvas.width - 100;
  const inputStartY = 60;
  const outputStartY = 80;
  const nodeRadius = 12;
  const inputSpacing = 30;
  const outputSpacing = 40;

  // Draw input nodes
  nodeValues.inputs.forEach((value, index) => {
    const y = inputStartY + (index * inputSpacing);
    
    // Calculate node color based on value (intensity)
    const intensity = Math.min(255, Math.max(0, Math.floor(value * 255)));
    const green = intensity;
    const red = 255 - intensity;
    const blue = 50;
    
    // Draw node
    ctx.beginPath();
    ctx.arc(inputLayerX, y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    
    // Draw node label with stronger visibility
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    
    // Draw stronger background for text for better contrast
    const textWidth = ctx.measureText(nodeValues.inputLabels[index]).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(inputLayerX - nodeRadius - 10 - textWidth, y - 8, textWidth + 8, 16);
    
    // Draw label with a black outline for better visibility
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(nodeValues.inputLabels[index], inputLayerX - nodeRadius - 10, y + 4);
    ctx.fillText(nodeValues.inputLabels[index], inputLayerX - nodeRadius - 10, y + 4);
    
    // Draw node value
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toFixed(2), inputLayerX, y + 4);
  });
  
  // Draw output nodes
  nodeValues.outputs.forEach((value, index) => {
    const y = outputStartY + (index * outputSpacing);
    
    // Calculate node color based on value (intensity)
    const intensity = Math.min(255, Math.max(0, Math.floor(value * 255)));
    const green = intensity;
    const red = 100;
    const blue = 255 - intensity;
    
    // Highlight the chosen direction
    const isChosen = index === nodeValues.outputs.indexOf(Math.max(...nodeValues.outputs));
    const borderWidth = isChosen ? 3 : 1;
    
    // Draw node
    ctx.beginPath();
    ctx.arc(outputLayerX, y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.fill();
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = isChosen ? '#FFFF00' : '#FFFFFF';
    ctx.stroke();
    
    // Draw node label with improved visibility
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    // Draw background for text
    const textWidth = ctx.measureText(nodeValues.outputLabels[index]).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(outputLayerX + nodeRadius + 8, y - 8, textWidth + 8, 16);
    
    // Draw text with outline
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(nodeValues.outputLabels[index], outputLayerX + nodeRadius + 10, y + 4);
    ctx.fillText(nodeValues.outputLabels[index], outputLayerX + nodeRadius + 10, y + 4);
    
    // Draw node value
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(value.toFixed(2), outputLayerX, y + 4);
    
    // Draw connections from inputs to selected output
    if (isChosen) {
      nodeValues.inputs.forEach((inputValue, inputIndex) => {
        const inputY = inputStartY + (inputIndex * inputSpacing);
        
        // Draw line with opacity based on input strength
        const opacity = Math.max(0.1, inputValue);
        ctx.beginPath();
        ctx.moveTo(inputLayerX + nodeRadius, inputY);
        ctx.lineTo(outputLayerX - nodeRadius, y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = Math.max(0.5, inputValue * 3);
        ctx.stroke();
      });
    }
  });
  
  // Draw explanation text
  ctx.fillStyle = '#AAAAAA';
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Inputs represent apple locations and obstacles in each direction', canvas.width / 2, canvas.height - 30);
  ctx.fillText('Yellow outline shows the selected direction', canvas.width / 2, canvas.height - 15);
};
