
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
 * Draw apples with highlight effect
 */
export const drawApples = (
  ctx: CanvasRenderingContext2D, 
  apples: Apple[], 
  frameCount: number, 
  cellSize: number
): void => {
  if (!apples || apples.length === 0) return;
  
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
 * Draw snake segments
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
    
    snake.positions.forEach((pos, segIdx) => {
      if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
        console.log(`Posición inválida en segmento ${segIdx} de serpiente ${index}:`, pos);
        return;
      }
      
      const brightness = Math.max(0.6, 1 - segIdx * 0.03);
      const r = parseInt(snakeColor.substring(1, 3), 16) * brightness;
      const g = parseInt(snakeColor.substring(3, 5), 16) * brightness;
      const b = parseInt(snakeColor.substring(5, 7), 16) * brightness;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      
      const x = pos.x * cellSize;
      const y = pos.y * cellSize;
      const size = cellSize - 2;
      
      if (segIdx === 0) {
        ctx.fillRect(x, y, size, size);
        
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
      } else {
        ctx.fillRect(
          x + 1,
          y + 1,
          size - 2,
          size - 2
        );
      }
    });
  });
};
