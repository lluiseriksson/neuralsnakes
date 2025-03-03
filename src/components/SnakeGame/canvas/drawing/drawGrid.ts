
/**
 * Draw the game grid with improved visual style
 */
export const drawGrid = (ctx: CanvasRenderingContext2D, gridSize: number, cellSize: number): void => {
  // Draw background with brighter gradient for better visibility
  const gradient = ctx.createLinearGradient(0, 0, gridSize * cellSize, gridSize * cellSize);
  gradient.addColorStop(0, '#121212');
  gradient.addColorStop(0.5, '#1a1a1a');
  gradient.addColorStop(1, '#121212');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, gridSize * cellSize, gridSize * cellSize);
  
  // Draw grid lines with improved contrast
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 0.75;
  
  // Draw vertical grid lines
  for (let x = 0; x <= gridSize; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, gridSize * cellSize);
    ctx.stroke();
  }
  
  // Draw horizontal grid lines
  for (let y = 0; y <= gridSize; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(gridSize * cellSize, y * cellSize);
    ctx.stroke();
  }
  
  // Add more visible grid intersection points
  ctx.fillStyle = '#333333';
  for (let x = 0; x <= gridSize; x++) {
    for (let y = 0; y <= gridSize; y++) {
      ctx.beginPath();
      ctx.arc(x * cellSize, y * cellSize, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
