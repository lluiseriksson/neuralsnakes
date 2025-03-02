
import { Snake, GameState, Direction } from "../../types";
import { GRID_SIZE } from "../../constants";
import { isOppositeDirection } from "../directionUtils";

// Function to identify adjacent cells with apples or obstacles
export const findAdjacentApples = (snake: Snake, gameState: GameState) => {
  if (!snake.positions || snake.positions.length === 0) return { adjacentApples: [], adjacentObstacles: [] };
  
  const head = snake.positions[0];
  const gridSize = snake.gridSize || GRID_SIZE;
  
  // Define adjacent cells for all four directions
  const adjacentCells = [
    { pos: { x: head.x, y: (head.y - 1 + gridSize) % gridSize }, dir: 'UP' as Direction },
    { pos: { x: (head.x + 1) % gridSize, y: head.y }, dir: 'RIGHT' as Direction },
    { pos: { x: head.x, y: (head.y + 1) % gridSize }, dir: 'DOWN' as Direction },
    { pos: { x: (head.x - 1 + gridSize) % gridSize, y: head.y }, dir: 'LEFT' as Direction }
  ];
  
  // Identify cells with apples
  const adjacentApples = adjacentCells.filter(cell => 
    gameState.apples.some(apple => 
      apple.position.x === cell.pos.x && apple.position.y === cell.pos.y
    )
  );
  
  // Identify cells with obstacles (other snakes or itself)
  const adjacentObstacles = adjacentCells.filter(cell => {
    // Avoid collision with any segment of any snake (including itself)
    for (const otherSnake of gameState.snakes) {
      if (!otherSnake.alive) continue;
      
      for (let i = 0; i < otherSnake.positions.length; i++) {
        // If it's the snake itself, don't avoid the tail (last segment) as it will move
        if (otherSnake.id === snake.id && i === otherSnake.positions.length - 1) continue;
        
        if (cell.pos.x === otherSnake.positions[i].x && cell.pos.y === otherSnake.positions[i].y) {
          return true;
        }
      }
    }
    return false;
  });
  
  return { adjacentApples, adjacentObstacles };
};

// Function to select a safe direction to eat an adjacent apple if available
export const getAppleEatingDirection = (
  snake: Snake, 
  gameState: GameState,
  adjacentApples: Array<{pos: {x: number, y: number}, dir: Direction}>,
  adjacentObstacles: Array<{pos: {x: number, y: number}, dir: Direction}>
): Direction | null => {
  if (!adjacentApples.length) return null;
  
  // Filter apple directions that are not opposite and don't have obstacles
  const safeAppleDirections = adjacentApples.filter(cell => 
    !isOppositeDirection(snake.direction, cell.dir) && 
    !adjacentObstacles.some(obstacle => 
      obstacle.pos.x === cell.pos.x && obstacle.pos.y === cell.pos.y
    )
  );
  
  // If there's a safe apple direction, take it
  if (safeAppleDirections.length > 0) {
    return safeAppleDirections[0].dir;
  }
  
  return null;
};
