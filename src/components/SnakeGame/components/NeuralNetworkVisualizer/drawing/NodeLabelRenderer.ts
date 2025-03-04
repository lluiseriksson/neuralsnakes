
/**
 * Class for rendering node labels with consistent styling
 */
export class NodeLabelRenderer {
  private ctx: CanvasRenderingContext2D;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  /**
   * Draw a text label with background for better visibility
   */
  drawLabel(
    text: string, 
    x: number, 
    y: number, 
    align: CanvasTextAlign = 'left',
    offset: number = 10
  ): void {
    this.ctx.font = 'bold 12px Arial'; // Larger font
    this.ctx.textAlign = align;
    
    // Calculate position based on alignment
    const textX = align === 'left' ? x + offset : x - offset;
    
    // Draw background for text with rounded corners
    const textMetrics = this.ctx.measureText(text);
    const textWidth = textMetrics.width;
    const bgX = align === 'left' ? textX - 4 : textX - textWidth - 8;
    
    const bgHeight = 18; // Taller background
    const bgY = y - 9;
    const cornerRadius = 4;
    
    // Draw rounded rectangle background with better contrast
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'; // Darker background
    this.ctx.beginPath();
    this.ctx.moveTo(bgX + cornerRadius, bgY);
    this.ctx.lineTo(bgX + textWidth + 10 - cornerRadius, bgY);
    this.ctx.arcTo(bgX + textWidth + 10, bgY, bgX + textWidth + 10, bgY + cornerRadius, cornerRadius);
    this.ctx.lineTo(bgX + textWidth + 10, bgY + bgHeight - cornerRadius);
    this.ctx.arcTo(bgX + textWidth + 10, bgY + bgHeight, bgX + textWidth + 10 - cornerRadius, bgY + bgHeight, cornerRadius);
    this.ctx.lineTo(bgX + cornerRadius, bgY + bgHeight);
    this.ctx.arcTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - cornerRadius, cornerRadius);
    this.ctx.lineTo(bgX, bgY + cornerRadius);
    this.ctx.arcTo(bgX, bgY, bgX + cornerRadius, bgY, cornerRadius);
    this.ctx.fill();
    
    // Add subtle border for improved contrast
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // Draw text with outline for better visibility
    this.ctx.fillStyle = '#FFFFFF'; // Pure white text
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 2;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;
    this.ctx.fillText(text, textX, y + 4);
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }
}
