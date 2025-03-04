
import { NodeLabelRenderer } from './NodeLabelRenderer';

// Draw a text label with background for better visibility
export const drawNodeLabel = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  x: number, 
  y: number, 
  align: CanvasTextAlign = 'left',
  offset: number = 10
) => {
  const labelRenderer = new NodeLabelRenderer(ctx);
  labelRenderer.drawLabel(text, x, y, align, offset);
};
