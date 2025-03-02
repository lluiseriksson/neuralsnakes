
// Draw a text label with background for better visibility
export const drawNodeLabel = (
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
