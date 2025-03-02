
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
  
  // Draw background for text with rounded corners
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const bgX = align === 'left' ? textX - 2 : textX - textWidth - 6;
  
  const bgHeight = 16;
  const bgY = y - 8;
  const cornerRadius = 4;
  
  // Draw rounded rectangle background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.moveTo(bgX + cornerRadius, bgY);
  ctx.lineTo(bgX + textWidth + 8 - cornerRadius, bgY);
  ctx.arcTo(bgX + textWidth + 8, bgY, bgX + textWidth + 8, bgY + cornerRadius, cornerRadius);
  ctx.lineTo(bgX + textWidth + 8, bgY + bgHeight - cornerRadius);
  ctx.arcTo(bgX + textWidth + 8, bgY + bgHeight, bgX + textWidth + 8 - cornerRadius, bgY + bgHeight, cornerRadius);
  ctx.lineTo(bgX + cornerRadius, bgY + bgHeight);
  ctx.arcTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - cornerRadius, cornerRadius);
  ctx.lineTo(bgX, bgY + cornerRadius);
  ctx.arcTo(bgX, bgY, bgX + cornerRadius, bgY, cornerRadius);
  ctx.fill();
  
  // Draw text with outline for better visibility
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(text, textX, y + 4);
  ctx.fillText(text, textX, y + 4);
};
