
import { Snake } from '../../types';
import { drawSnakeBody } from './snakeParts/drawSnakeBody';
import { drawSnakeHead } from './snakeParts/drawSnakeHead';
import { drawSnakeEyes } from './snakeParts/drawSnakeEyes';

/**
 * SnakeRenderer class to coordinate snake rendering operations
 */
export class SnakeRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  
  constructor(ctx: CanvasRenderingContext2D, cellSize: number) {
    this.ctx = ctx;
    this.cellSize = cellSize;
  }
  
  /**
   * Render a single snake with all its parts
   */
  renderSnake(snake: Snake, isSelected: boolean = false): void {
    if (!snake.alive || !snake.positions || snake.positions.length === 0) return;
    
    // Draw snake body
    drawSnakeBody(this.ctx, snake, this.cellSize);
    
    // Draw snake head
    drawSnakeHead(this.ctx, snake, this.cellSize, isSelected);
    
    // Draw snake eyes
    drawSnakeEyes(this.ctx, snake, this.cellSize);
  }
  
  /**
   * Render multiple snakes
   */
  renderSnakes(snakes: Snake[], selectedSnakeId: number | null = null): void {
    if (!snakes || snakes.length === 0) return;
    
    snakes.forEach(snake => {
      const isSelected = selectedSnakeId !== null && snake.id === selectedSnakeId;
      this.renderSnake(snake, isSelected);
    });
  }
}
