
import { Snake } from '../../types';

/**
 * Draws all snakes on the canvas with highlighting for the selected snake
 */
export const drawSnakes = (
  ctx: CanvasRenderingContext2D,
  snakes: Snake[],
  cellSize: number,
  selectedSnakeId: number | null = null
): void => {
  if (!snakes || snakes.length === 0) return;

  snakes.forEach(snake => {
    if (!snake.alive || !snake.positions || snake.positions.length === 0) return;

    const isSelected = selectedSnakeId !== null && snake.id === selectedSnakeId;
    
    // Draw snake body segments
    ctx.fillStyle = snake.color;
    
    // Draw segments from tail to head (excluding head)
    for (let i = snake.positions.length - 1; i > 0; i--) {
      const segment = snake.positions[i];
      
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      );
    }
    
    // Draw snake head with special styling
    const head = snake.positions[0];
    
    // Highlight selected snake with a glow effect
    if (isSelected) {
      ctx.save();
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 10;
      ctx.fillRect(
        head.x * cellSize,
        head.y * cellSize,
        cellSize,
        cellSize
      );
      ctx.restore();
    } else {
      // Regular head
      ctx.fillRect(
        head.x * cellSize,
        head.y * cellSize,
        cellSize,
        cellSize
      );
    }
    
    // Draw eyes on snake head
    ctx.fillStyle = 'white';
    
    // Position eyes based on direction
    let eyeX1 = 0, eyeY1 = 0, eyeX2 = 0, eyeY2 = 0;
    const eyeSize = cellSize / 5;
    const eyeOffset = cellSize / 4;
    
    switch (snake.direction) {
      case 'UP':
        eyeX1 = head.x * cellSize + eyeOffset;
        eyeY1 = head.y * cellSize + eyeOffset;
        eyeX2 = head.x * cellSize + cellSize - eyeOffset - eyeSize;
        eyeY2 = head.y * cellSize + eyeOffset;
        break;
      case 'DOWN':
        eyeX1 = head.x * cellSize + eyeOffset;
        eyeY1 = head.y * cellSize + cellSize - eyeOffset - eyeSize;
        eyeX2 = head.x * cellSize + cellSize - eyeOffset - eyeSize;
        eyeY2 = head.y * cellSize + cellSize - eyeOffset - eyeSize;
        break;
      case 'LEFT':
        eyeX1 = head.x * cellSize + eyeOffset;
        eyeY1 = head.y * cellSize + eyeOffset;
        eyeX2 = head.x * cellSize + eyeOffset;
        eyeY2 = head.y * cellSize + cellSize - eyeOffset - eyeSize;
        break;
      case 'RIGHT':
        eyeX1 = head.x * cellSize + cellSize - eyeOffset - eyeSize;
        eyeY1 = head.y * cellSize + eyeOffset;
        eyeX2 = head.x * cellSize + cellSize - eyeOffset - eyeSize;
        eyeY2 = head.y * cellSize + cellSize - eyeOffset - eyeSize;
        break;
    }
    
    // Draw the eyes
    ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
    ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
    
    // Add a small marker to indicate snake ID
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = `${cellSize / 2}px Arial`;
    ctx.fillText(
      `${snake.id}`, 
      head.x * cellSize + cellSize / 3, 
      head.y * cellSize + cellSize / 1.5
    );
  });
};
