
interface NodeValues {
  inputs: number[];
  outputs: number[];
  inputLabels: string[];
  outputLabels: string[];
}

type NodePosition = {
  x: number;
  y: number;
};

// Draw the title and explanation text for the network visualization
const drawNetworkTitle = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  // Draw title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Neural Network Decision Visualization', canvas.width / 2, 20);

  // Draw explanation text
  ctx.fillStyle = '#AAAAAA';
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Inputs represent apple locations and obstacles in each direction', canvas.width / 2, canvas.height - 30);
  ctx.fillText('Yellow outline shows the selected direction', canvas.width / 2, canvas.height - 15);
};

// Calculate node color based on its activation value
const getNodeColor = (value: number, isInput: boolean): string => {
  const intensity = Math.min(255, Math.max(0, Math.floor(value * 255)));
  
  if (isInput) {
    // Input nodes: Red to Green spectrum with some blue
    const green = intensity;
    const red = 255 - intensity;
    const blue = 50;
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // Output nodes: Blue to Green spectrum with some red
    const green = intensity;
    const red = 100;
    const blue = 255 - intensity;
    return `rgb(${red}, ${green}, ${blue})`;
  }
};

// Draw a text label with background for better visibility
const drawNodeLabel = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  align: CanvasTextAlign = 'left',
  offset: number = 10
) => {
  ctx.font = '11px Arial';
  ctx.textAlign = align;
  
  // Calculate position based on alignment
  const textX = align === 'left' ? x + offset : x - offset;
  
  // Draw background for text
  const textWidth = ctx.measureText(text).width;
  const bgX = align === 'left' ? textX - 2 : textX - textWidth - 6;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(bgX, y - 8, textWidth + 8, 16);
  
  // Draw text with outline for better visibility
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(text, textX, y + 4);
  ctx.fillText(text, textX, y + 4);
};

// Draw a single node (input or output)
const drawNode = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  value: number, 
  label: string, 
  isInput: boolean,
  isSelected: boolean = false,
  nodeRadius: number = 12
) => {
  // Get color based on activation value
  const color = getNodeColor(value, isInput);
  
  // Draw node circle
  ctx.beginPath();
  ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  
  // Draw node border
  const borderWidth = isSelected ? 3 : 1;
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = isSelected ? '#FFFF00' : '#FFFFFF';
  ctx.stroke();
  
  // Draw node label
  const labelAlign = isInput ? 'right' : 'left';
  const offset = nodeRadius + 10;
  drawNodeLabel(ctx, label, x, y, labelAlign, offset);
  
  // Draw node value inside the circle
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(value.toFixed(2), x, y + 4);
  
  return { x, y };
};

// Draw input nodes
const drawInputNodes = (
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

// Draw output nodes
const drawOutputNodes = (
  ctx: CanvasRenderingContext2D, 
  nodeValues: NodeValues, 
  outputLayerX: number, 
  outputStartY: number, 
  outputSpacing: number,
  nodeRadius: number = 12
): { positions: NodePosition[], selectedIndex: number } => {
  const positions: NodePosition[] = [];
  
  // Find the selected (highest activation) output
  const selectedIndex = nodeValues.outputs.indexOf(Math.max(...nodeValues.outputs));
  
  nodeValues.outputs.forEach((value, index) => {
    const y = outputStartY + (index * outputSpacing);
    const isSelected = index === selectedIndex;
    
    const position = drawNode(
      ctx, 
      outputLayerX, 
      y, 
      value, 
      nodeValues.outputLabels[index], 
      false,
      isSelected,
      nodeRadius
    );
    
    positions.push(position);
  });
  
  return { positions, selectedIndex };
};

// Draw connections between input and selected output nodes
const drawConnections = (
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
    
    // Draw line with opacity based on input strength
    const opacity = Math.max(0.1, inputValue);
    ctx.beginPath();
    ctx.moveTo(inputPos.x + nodeRadius, inputPos.y);
    ctx.lineTo(selectedOutput.x - nodeRadius, selectedOutput.y);
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = Math.max(0.5, inputValue * 3);
    ctx.stroke();
  });
};

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
  
  // Draw title and explanation
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
};
