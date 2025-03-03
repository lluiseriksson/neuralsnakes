
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
  ctx.strokeStyle = '#333333'; // Increased contrast for better visibility
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
  
  // Add more visible grid intersection points (reduced density)
  ctx.fillStyle = '#3a3a3a';
  for (let x = 0; x <= gridSize; x += 5) { // Draw every 5th point
    for (let y = 0; y <= gridSize; y += 5) {
      ctx.beginPath();
      ctx.arc(x * cellSize, y * cellSize, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Add subtle coordinate markers at edges
  ctx.font = '8px Arial';
  ctx.fillStyle = '#555555';
  ctx.textAlign = 'center';
  
  // Only draw coordinates every 5th position to reduce visual clutter
  for (let i = 0; i <= gridSize; i += 5) {
    // Draw horizontal coordinates
    ctx.fillText(`${i}`, i * cellSize, gridSize * cellSize - 2);
    
    // Draw vertical coordinates
    ctx.fillText(`${i}`, 8, i * cellSize + 8);
  }
};
