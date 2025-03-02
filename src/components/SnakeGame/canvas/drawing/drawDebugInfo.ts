
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
    
    // Draw direction arrow based on the decision direction
    const arrowSize = cellSize / 2.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    // Draw arrow pointing in the direction of movement
    const drawArrow = (direction: string) => {
      switch (direction) {
        case 'UP':
          ctx.beginPath();
          ctx.moveTo(x + cellSize / 2, y - arrowSize / 2);
          ctx.lineTo(x + cellSize / 2 - arrowSize / 2, y);
          ctx.lineTo(x + cellSize / 2 + arrowSize / 2, y);
          ctx.fill();
          break;
        case 'DOWN':
          ctx.beginPath();
          ctx.moveTo(x + cellSize / 2, y + cellSize + arrowSize / 2);
          ctx.lineTo(x + cellSize / 2 - arrowSize / 2, y + cellSize);
          ctx.lineTo(x + cellSize / 2 + arrowSize / 2, y + cellSize);
          ctx.fill();
          break;
        case 'LEFT':
          ctx.beginPath();
          ctx.moveTo(x - arrowSize / 2, y + cellSize / 2);
          ctx.lineTo(x, y + cellSize / 2 - arrowSize / 2);
          ctx.lineTo(x, y + cellSize / 2 + arrowSize / 2);
          ctx.fill();
          break;
        case 'RIGHT':
          ctx.beginPath();
          ctx.moveTo(x + cellSize + arrowSize / 2, y + cellSize / 2);
          ctx.lineTo(x + cellSize, y + cellSize / 2 - arrowSize / 2);
          ctx.lineTo(x + cellSize, y + cellSize / 2 + arrowSize / 2);
          ctx.fill();
          break;
      }
    };
    
    // Draw an arrow showing the chosen direction
    drawArrow(debugInfo.lastDecision.direction);
  }
  
  // Draw danger zones if any
  if (debugInfo.collisionInfo && debugInfo.collisionInfo.nearbyApples) {
    const headPos = snake.positions[0];
    
    // Mark dangerous cells with red overlay
    if (snake.lastInputs && snake.lastInputs.length >= 8) {
      // The last 4 inputs represent obstacles in UP, RIGHT, DOWN, LEFT directions
      const obstacleInputs = snake.lastInputs.slice(4, 8);
      const directions = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
      
      obstacleInputs.forEach((value, index) => {
        if (value > 0.5) { // If there's a significant obstacle
          let dangerX = headPos.x;
          let dangerY = headPos.y;
          
          // Calculate position based on direction
          switch (directions[index]) {
            case 'UP': dangerY = headPos.y - 1; break;
            case 'RIGHT': dangerX = headPos.x + 1; break;
            case 'DOWN': dangerY = headPos.y + 1; break;
            case 'LEFT': dangerX = headPos.x - 1; break;
          }
          
          // Draw danger cell
          ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
          ctx.fillRect(
            dangerX * cellSize,
            dangerY * cellSize,
            cellSize,
            cellSize
          );
          
          // Add a warning sign
          ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            '!',
            dangerX * cellSize + cellSize / 2,
            dangerY * cellSize + cellSize / 2 + 3
          );
        }
      });
    }
  }
  
  // Draw decision history as a trail (if available)
  if (debugInfo.decisions && debugInfo.decisions.length > 0) {
    // Only show the last few decisions to avoid clutter
    const recentDecisions = debugInfo.decisions.slice(-5);
    
    recentDecisions.forEach((decision, index) => {
      // Make older decisions more transparent
      const alpha = 0.3 + (index / recentDecisions.length) * 0.5;
      
      ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(
        decision.headPosition.x * cellSize + cellSize / 2,
        decision.headPosition.y * cellSize + cellSize / 2,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Connect the dots with a line
      if (index > 0) {
        const prevDecision = recentDecisions[index - 1];
        ctx.beginPath();
        ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.moveTo(
          prevDecision.headPosition.x * cellSize + cellSize / 2,
          prevDecision.headPosition.y * cellSize + cellSize / 2
        );
        ctx.lineTo(
          decision.headPosition.x * cellSize + cellSize / 2,
          decision.headPosition.y * cellSize + cellSize / 2
        );
        ctx.stroke();
      }
    });
  }
  
  // Draw apple potential indicators if nearby apples are available
  if (debugInfo.collisionInfo && debugInfo.collisionInfo.nearbyApples && 
      debugInfo.collisionInfo.nearbyApples.length > 0) {
    
    // Draw a highlight around nearby apples to show they're being considered
    debugInfo.collisionInfo.nearbyApples.forEach((appleInfo, index) => {
      // Highlight more intensely for closer apples
      const intensity = Math.max(0.4, 1 - (index * 0.2));
      
      ctx.beginPath();
      ctx.arc(
        appleInfo.position.x * cellSize + cellSize / 2,
        appleInfo.position.y * cellSize + cellSize / 2,
        cellSize * 0.8,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = `rgba(0, 255, 0, ${intensity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add value indicator for this apple
      if (index === 0) { // Only for the closest apple
        ctx.font = '9px Arial';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(
          '✓',
          appleInfo.position.x * cellSize + cellSize / 2,
          appleInfo.position.y * cellSize - 5
        );
      }
    });
  }
  
  // Draw learning feedback (reward/penalty visualization)
  if (debugInfo.learningEvents && debugInfo.learningEvents.length > 0) {
    // Get the most recent learning event
    const latestEvent = debugInfo.learningEvents[debugInfo.learningEvents.length - 1];
    
    if (latestEvent.reward !== undefined) {
      // Draw a visual indicator of the reward/penalty
      const headPos = snake.positions[0];
      const x = headPos.x * cellSize + cellSize / 2;
      const y = headPos.y * cellSize - cellSize;
      
      // Different visualizations based on positive or negative reward
      if (latestEvent.reward > 0) {
        // Positive reward - green glow
        const glowRadius = Math.min(30, Math.max(10, latestEvent.reward * 20));
        
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, 'rgba(0, 255, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a + symbol
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+', x, y + 4);
      } else if (latestEvent.reward < 0) {
        // Negative reward - red flash
        const flashRadius = Math.min(30, Math.max(10, Math.abs(latestEvent.reward) * 20));
        
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, flashRadius);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(x, y, flashRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a - symbol
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('-', x, y + 4);
      }
    }
  }
};
