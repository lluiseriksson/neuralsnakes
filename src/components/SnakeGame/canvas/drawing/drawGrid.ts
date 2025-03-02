
/**
 * Draw the game grid
 */
export const drawGrid = (ctx: CanvasRenderingContext2D, gridSize: number, cellSize: number): void => {
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
};
