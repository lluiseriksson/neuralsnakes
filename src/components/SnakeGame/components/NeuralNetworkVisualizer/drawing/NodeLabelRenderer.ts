
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
    this.ctx.font = '11px Arial';
    this.ctx.textAlign = align;
    
    // Calculate position based on alignment
    const textX = align === 'left' ? x + offset : x - offset;
    
    // Draw background for text with rounded corners
    const textMetrics = this.ctx.measureText(text);
    const textWidth = textMetrics.width;
    const bgX = align === 'left' ? textX - 2 : textX - textWidth - 6;
    
    const bgHeight = 16;
    const bgY = y - 8;
    const cornerRadius = 4;
    
    // Draw rounded rectangle background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.beginPath();
    this.ctx.moveTo(bgX + cornerRadius, bgY);
    this.ctx.lineTo(bgX + textWidth + 8 - cornerRadius, bgY);
    this.ctx.arcTo(bgX + textWidth + 8, bgY, bgX + textWidth + 8, bgY + cornerRadius, cornerRadius);
    this.ctx.lineTo(bgX + textWidth + 8, bgY + bgHeight - cornerRadius);
    this.ctx.arcTo(bgX + textWidth + 8, bgY + bgHeight, bgX + textWidth + 8 - cornerRadius, bgY + bgHeight, cornerRadius);
    this.ctx.lineTo(bgX + cornerRadius, bgY + bgHeight);
    this.ctx.arcTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - cornerRadius, cornerRadius);
    this.ctx.lineTo(bgX, bgY + cornerRadius);
    this.ctx.arcTo(bgX, bgY, bgX + cornerRadius, bgY, cornerRadius);
    this.ctx.fill();
    
    // Draw text with outline for better visibility
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#000000';
    this.ctx.strokeText(text, textX, y + 4);
    this.ctx.fillText(text, textX, y + 4);
  }
}
