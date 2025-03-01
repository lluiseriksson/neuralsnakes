import { Position, Snake, GameState } from '../../types';

/**
 * Detects obstacles in the four cardinal directions around the snake's head
 * with look-ahead for better obstacle avoidance
 */
export const detectObstacles = (head: Position, snake: Snake, gameState: GameState): number[] => {
  // Initialize obstacles array [UP, RIGHT, DOWN, LEFT]
  const obstacles = [0, 0, 0, 0];
  const gridSize = snake.gridSize;
  
  // Create look-ahead positions (check 3 steps ahead for better planning)
  const lookAheadPositions = [
    // UP: 1, 2, and 3 steps
    [
      { x: head.x, y: (head.y - 1 + gridSize) % gridSize },
      { x: head.x, y: (head.y - 2 + gridSize) % gridSize },
      { x: head.x, y: (head.y - 3 + gridSize) % gridSize }
    ],
    // RIGHT: 1, 2, and 3 steps
    [
      { x: (head.x + 1) % gridSize, y: head.y },
      { x: (head.x + 2) % gridSize, y: head.y },
      { x: (head.x + 3) % gridSize, y: head.y }
    ],
    // DOWN: 1, 2, and 3 steps
    [
      { x: head.x, y: (head.y + 1) % gridSize },
      { x: head.x, y: (head.y + 2) % gridSize },
      { x: head.x, y: (head.y + 3) % gridSize }
    ],
    // LEFT: 1, 2, and 3 steps
    [
      { x: (head.x - 1 + gridSize) % gridSize, y: head.y },
      { x: (head.x - 2 + gridSize) % gridSize, y: head.y },
      { x: (head.x - 3 + gridSize) % gridSize, y: head.y }
    ]
  ];
  
  // Self-collision detection (avoid its own body)
  for (let i = 0; i < snake.positions.length; i++) {
    const segment = snake.positions[i];
    
    // Check all directions for each distance
    for (let dir = 0; dir < 4; dir++) {
      // Check immediate position (strongest signal)
      if (lookAheadPositions[dir][0].x === segment.x && lookAheadPositions[dir][0].y === segment.y) {
        obstacles[dir] = 1; // Immediate obstacle (strongest signal)
      }
      // Check second position (medium signal)
      else if (obstacles[dir] < 0.8 && lookAheadPositions[dir][1].x === segment.x && lookAheadPositions[dir][1].y === segment.y) {
        obstacles[dir] = 0.8; // Medium distance obstacle
      }
      // Check third position (weaker signal)
      else if (obstacles[dir] < 0.6 && lookAheadPositions[dir][2].x === segment.x && lookAheadPositions[dir][2].y === segment.y) {
        obstacles[dir] = 0.6; // Further obstacle (weaker signal)
      }
    }
  }
  
  // Other snakes collision detection
  for (const otherSnake of gameState.snakes) {
    if (otherSnake.id === snake.id || !otherSnake.alive) continue;
    
    for (const segment of otherSnake.positions) {
      // Check all directions for each distance
      for (let dir = 0; dir < 4; dir++) {
        // Check immediate position (strongest signal)
        if (lookAheadPositions[dir][0].x === segment.x && lookAheadPositions[dir][0].y === segment.y) {
          obstacles[dir] = 1; // Immediate obstacle
        }
        // Check second position (medium signal)
        else if (obstacles[dir] < 0.8 && lookAheadPositions[dir][1].x === segment.x && lookAheadPositions[dir][1].y === segment.y) {
          obstacles[dir] = 0.8; // Medium distance obstacle
        }
        // Check third position (weaker signal)
        else if (obstacles[dir] < 0.6 && lookAheadPositions[dir][2].x === segment.x && lookAheadPositions[dir][2].y === segment.y) {
          obstacles[dir] = 0.6; // Further obstacle (weaker signal)
        }
      }
    }
  }
  
  return obstacles;
};
