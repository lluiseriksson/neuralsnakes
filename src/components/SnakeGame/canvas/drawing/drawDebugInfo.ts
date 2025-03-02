
import { Snake } from '../../types';

/**
 * Draw debug information on the canvas if available
 */
export const drawDebugInfo = (
  ctx: CanvasRenderingContext2D,
  snake: Snake,
  cellSize: number
): void => {
  if (!snake || !snake.debugInfo) return;
  
  const { debugInfo } = snake;
  
  // Draw path to closest apple if available
  if (debugInfo.collisionInfo && debugInfo.collisionInfo.closestAppleDistance !== null) {
    const headPos = snake.positions[0];
    
    // Draw a line to the closest apple
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    
    ctx.moveTo(
      headPos.x * cellSize + cellSize / 2,
      headPos.y * cellSize + cellSize / 2
    );
    
    // Find closest apple
    if (debugInfo.collisionInfo.nearbyApples && debugInfo.collisionInfo.nearbyApples.length > 0) {
      const closestApple = debugInfo.collisionInfo.nearbyApples[0];
      ctx.lineTo(
        closestApple.position.x * cellSize + cellSize / 2,
        closestApple.position.y * cellSize + cellSize / 2
      );
      ctx.stroke();
      
      // Draw distance text
      ctx.font = '9px Arial';
      ctx.fillStyle = 'yellow';
      ctx.textAlign = 'center';
      ctx.setLineDash([]);
      
      // Calculate midpoint of line for distance label
      const midX = (headPos.x + closestApple.position.x) * cellSize / 2 + cellSize / 2;
      const midY = (headPos.y + closestApple.position.y) * cellSize / 2 + cellSize / 2;
      
      ctx.fillText(
        `${debugInfo.collisionInfo.closestAppleDistance}`,
        midX,
        midY
      );
    }
    
    ctx.setLineDash([]);
  }
  
  // Draw last decision information if available
  if (debugInfo.lastDecision) {
    const headPos = snake.positions[0];
    const x = headPos.x * cellSize;
    const y = headPos.y * cellSize;
    
    // Draw decision reason above the snake
    ctx.font = '8px Arial';
    ctx.fillStyle = '#aaffaa';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${debugInfo.lastDecision.reason}`,
      x + cellSize / 2,
      y - 12
    );
    
    // Draw confidence if available
    if (debugInfo.lastDecision.confidence !== undefined) {
      ctx.fillStyle = debugInfo.lastDecision.confidence > 0.6 ? '#aaffaa' : '#ffaaaa';
      ctx.fillText(
        `conf: ${debugInfo.lastDecision.confidence.toFixed(2)}`,
        x + cellSize / 2,
        y - 3
      );
    }
  }
};
