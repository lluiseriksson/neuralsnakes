
/**
 * Draw the game grid with improved visual style for better visibility
 */
export const drawGrid = (ctx: CanvasRenderingContext2D, gridSize: number, cellSize: number): void => {
  // Draw background with darker gradient for better contrast
  const gradient = ctx.createLinearGradient(0, 0, gridSize * cellSize, gridSize * cellSize);
  gradient.addColorStop(0, '#0A0A0A');
  gradient.addColorStop(0.5, '#101010');
  gradient.addColorStop(1, '#0A0A0A');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, gridSize * cellSize, gridSize * cellSize);
  
  // Draw grid lines with improved contrast
  ctx.strokeStyle = '#2A2A2A'; // Increased contrast for better visibility
  ctx.lineWidth = 0.5; // Thinner lines for less distraction
  
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
  ctx.fillStyle = '#3A3A3A';
  for (let x = 0; x <= gridSize; x += 5) {
    for (let y = 0; y <= gridSize; y += 5) {
      ctx.beginPath();
      ctx.arc(x * cellSize, y * cellSize, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Add coordinate markers at edges
  ctx.font = '10px Arial';
  ctx.fillStyle = '#666666';
  ctx.textAlign = 'center';
  
  // Draw coordinates every 5th position to reduce visual clutter
  for (let i = 0; i <= gridSize; i += 5) {
    // Draw horizontal coordinates
    ctx.fillText(`${i}`, i * cellSize, gridSize * cellSize - 4);
    
    // Draw vertical coordinates
    ctx.fillText(`${i}`, 10, i * cellSize + 10);
  }
};
