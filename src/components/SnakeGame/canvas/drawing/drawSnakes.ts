
import { Snake } from '../../types';

/**
 * Draw snake segments with improved visibility and direction indicators
 */
export const drawSnakes = (
  ctx: CanvasRenderingContext2D, 
  snakes: Snake[], 
  cellSize: number,
  selectedSnakeId?: number | null
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
    
    const isSelected = selectedSnakeId !== undefined && selectedSnakeId !== null && snake.id === selectedSnakeId;
    const snakeColor = isSelected ? '#ffff00' : snake.color || '#ffffff';
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
