
/**
 * Draw the game grid with improved visual style
 */
export const drawGrid = (ctx: CanvasRenderingContext2D, gridSize: number, cellSize: number): void => {
  // Draw background with subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, gridSize * cellSize, gridSize * cellSize);
  gradient.addColorStop(0, '#000000');
  gradient.addColorStop(0.5, '#0a0a0a');
  gradient.addColorStop(1, '#000000');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, gridSize * cellSize, gridSize * cellSize);
  
  // Draw grid lines with improved style
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 0.5;
  
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
  
  // Add subtle grid intersection points for better visual guidance
  ctx.fillStyle = '#222222';
  for (let x = 0; x <= gridSize; x++) {
    for (let y = 0; y <= gridSize; y++) {
      ctx.beginPath();
      ctx.arc(x * cellSize, y * cellSize, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
