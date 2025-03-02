
import { GameState, Snake, Apple } from '../types';
import { CELL_SIZE } from '../constants';

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

/**
 * Draw apples with highlight effect and improved visibility
 */
export const drawApples = (
  ctx: CanvasRenderingContext2D, 
  apples: Apple[], 
  frameCount: number, 
  cellSize: number
): void => {
  if (!apples || apples.length === 0) return;
  
  // Draw glow effect for apples
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#ff6666';
  
  apples.forEach(apple => {
    if (apple && apple.position) {
      ctx.beginPath();
      ctx.arc(
        apple.position.x * cellSize + cellSize / 2,
        apple.position.y * cellSize + cellSize / 2,
        cellSize / 1.5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  });
  
  ctx.restore();
  
  // Draw main apple shape
  ctx.fillStyle = '#ff0000';
  apples.forEach(apple => {
    if (apple && apple.position) {
      ctx.beginPath();
      ctx.arc(
        apple.position.x * cellSize + cellSize / 2,
        apple.position.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  });

  // Apple highlight effect that changes with frame count
  if (frameCount % 3 === 0) {
    ctx.fillStyle = '#ff6666';
    apples.forEach(apple => {
      if (apple && apple.position) {
        ctx.beginPath();
        ctx.arc(
          apple.position.x * cellSize + cellSize / 3,
          apple.position.y * cellSize + cellSize / 3,
          2,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });
  }
};

/**
 * Draw snake segments with improved visibility and direction indicators
 */
export const drawSnakes = (
  ctx: CanvasRenderingContext2D, 
  snakes: Snake[], 
  cellSize: number
): void => {
  if (!snakes || !Array.isArray(snakes) || snakes.length === 0) {
    console.log('No hay serpientes para dibujar:', snakes);
    return;
  }
  
  console.log(`Dibujando ${snakes.length} serpientes en el canvas`);
  const aliveSnakes = snakes.filter(s => s && s.alive);
  console.log(`${aliveSnakes.length} serpientes vivas`);
  
  snakes.forEach((snake, index) => {
    if (!snake) {
      console.log(`Serpiente ${index} es null o undefined`);
      return;
    }
    
    if (!snake.positions || !Array.isArray(snake.positions) || snake.positions.length === 0) {
      console.log(`Serpiente ${index} tiene posiciones inválidas:`, snake.positions);
      return;
    }
    
    if (!snake.alive) {
      console.log(`Serpiente ${index} está muerta, no se dibuja`);
      return;
    }
    
    const snakeColor = snake.color || '#ffffff';
    console.log(`Dibujando serpiente ${index} con color ${snakeColor} y ${snake.positions.length} segmentos`);
    
    // Draw snake body segments
    snake.positions.forEach((pos, segIdx) => {
      if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
        console.log(`Posición inválida en segmento ${segIdx} de serpiente ${index}:`, pos);
        return;
      }
      
      // Create a gradient effect for the snake body
      const brightness = Math.max(0.6, 1 - segIdx * 0.03);
      const r = parseInt(snakeColor.substring(1, 3), 16) * brightness;
      const g = parseInt(snakeColor.substring(3, 5), 16) * brightness;
      const b = parseInt(snakeColor.substring(5, 7), 16) * brightness;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      
      const x = pos.x * cellSize;
      const y = pos.y * cellSize;
      const size = cellSize - 2;
      
      // Draw head with eyes
      if (segIdx === 0) {
        // Draw subtle glow around head
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
        ctx.restore();
        
        // Draw head
        ctx.fillStyle = snakeColor;
        ctx.fillRect(x, y, size, size);
        
        // Draw eyes based on direction
        ctx.fillStyle = 'white';
        
        let leftEyeX = x + cellSize / 4;
        let leftEyeY = y + cellSize / 4;
        let rightEyeX = x + cellSize * 2/3;
        let rightEyeY = y + cellSize / 4;
        
        if (snake.direction === 'DOWN') {
          leftEyeY = rightEyeY = y + cellSize * 2/3;
        } else if (snake.direction === 'LEFT') {
          leftEyeX = rightEyeX = x + cellSize / 4;
          rightEyeY = y + cellSize * 2/3;
        } else if (snake.direction === 'RIGHT') {
          leftEyeX = rightEyeX = x + cellSize * 2/3;
          rightEyeY = y + cellSize * 2/3;
        }
        
        ctx.fillRect(
          leftEyeX,
          leftEyeY,
          cellSize / 6, 
          cellSize / 6
        );
        ctx.fillRect(
          rightEyeX,
          rightEyeY,
          cellSize / 6, 
          cellSize / 6
        );
        
        // Draw a small score indicator above the snake head
        ctx.font = '10px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${snake.score}`, 
          x + size / 2, 
          y - 5
        );
      } else {
        // Draw body segments with rounded corners for a smoother look
        ctx.beginPath();
        ctx.roundRect(
          x + 1,
          y + 1,
          size - 2,
          size - 2,
          2 // Corner radius
        );
        ctx.fill();
      }
    });
  });
};

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
};
