
import { Snake, Position, Direction, GameState } from "./types";
import { GRID_SIZE } from "./constants";

export const generateInitialSnake = (x: number, y: number): Position[] => {
  // Create initial snake with three segments
  return [
    { x, y },
    { x, y: y + 1 },
    { x, y: y + 2 }
  ];
};

const isOppositeDirection = (current: Direction, next: Direction): boolean => {
  return (
    (current === 'UP' && next === 'DOWN') ||
    (current === 'DOWN' && next === 'UP') ||
    (current === 'LEFT' && next === 'RIGHT') ||
    (current === 'RIGHT' && next === 'LEFT')
  );
};

// Function to detect if a move would result in immediate collision
export const wouldCollide = (newHead: Position, snake: Snake, gameState: GameState): boolean => {
  // Check collision with self (excluding the tail which will move)
  for (let i = 0; i < snake.positions.length - 1; i++) {
    if (newHead.x === snake.positions[i].x && newHead.y === snake.positions[i].y) {
      return true;
    }
  }
  
  // Check collision with other snakes
  for (const otherSnake of gameState.snakes) {
    if (otherSnake.id === snake.id || !otherSnake.alive) continue;
    
    for (const segment of otherSnake.positions) {
      if (newHead.x === segment.x && newHead.y === segment.y) {
        return true;
      }
    }
  }
  
  return false;
};

// Function to find a safe direction when the snake is in danger of collision
const findSafeDirection = (snake: Snake, gameState: GameState, currentPrediction: number[]): Direction => {
  if (!snake.positions || snake.positions.length === 0) return snake.direction;
  
  const head = snake.positions[0];
  const gridSize = snake.gridSize || GRID_SIZE;
  
  // Define all possible directions and their corresponding new heads
  const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
  const newHeads: {direction: Direction, head: Position, score: number}[] = [
    { 
      direction: 'UP', 
      head: { x: head.x, y: (head.y - 1 + gridSize) % gridSize },
      score: currentPrediction[0] || 0
    },
    { 
      direction: 'RIGHT', 
      head: { x: (head.x + 1) % gridSize, y: head.y },
      score: currentPrediction[1] || 0
    },
    { 
      direction: 'DOWN', 
      head: { x: head.x, y: (head.y + 1) % gridSize },
      score: currentPrediction[2] || 0
    },
    { 
      direction: 'LEFT', 
      head: { x: (head.x - 1 + gridSize) % gridSize, y: head.y },
      score: currentPrediction[3] || 0
    }
  ];
  
  // Filter out opposite direction
  const possibleMoves = newHeads.filter(move => !isOppositeDirection(snake.direction, move.direction));
  
  // Check which moves are safe (don't result in collision)
  const safeMoves = possibleMoves.filter(move => !wouldCollide(move.head, snake, gameState));
  
  if (safeMoves.length === 0) {
    // No safe moves, just try to avoid the opposite direction
    console.log(`No safe moves for snake ${snake.id}, trying to avoid opposite direction`);
    return possibleMoves.length > 0 ? possibleMoves[0].direction : snake.direction;
  }
  
  // Sort safe moves by their neural network score (higher is better)
  safeMoves.sort((a, b) => b.score - a.score);
  
  // Return the direction with the highest score
  return safeMoves[0].direction;
};

export const moveSnake = (snake: Snake, gameState: GameState, predictions?: number[]): Snake => {
  // Safety check - if snake is not alive, don't move it
  if (!snake || !snake.alive) {
    return snake;
  }
  
  // Safety check - ensure snake has positions
  if (!snake.positions || snake.positions.length === 0) {
    console.error(`Snake ${snake.id} without valid positions:`, snake);
    return snake;
  }
  
  // Make a deep copy of positions to avoid accidental modifications
  const positions = [...snake.positions.map(pos => ({ ...pos }))];
  const head = positions[0];
  let newHead = { ...head };
  let newDirection = snake.direction;
  
  // Use the snake's gridSize or fall back to GRID_SIZE constant
  const gridSize = snake.gridSize || GRID_SIZE;

  if (predictions && predictions.length === 4) {
    // Use neural network predictions for movement
    // Add a small random factor to break ties and encourage exploration
    const randomFactor = 0.05; // Reduced from 0.1 to make decisions more deterministic
    const adjustedPredictions = predictions.map(p => p + Math.random() * randomFactor);
    
    // Find the direction with the highest prediction value
    const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    const maxIndex = adjustedPredictions.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    const predictedDirection = directions[maxIndex];
    
    // Only allow direction change if not opposite to current direction
    if (!isOppositeDirection(snake.direction, predictedDirection)) {
      newDirection = predictedDirection;
      
      // Create a temporary new head to check if it would result in collision
      let tempHead = { ...head };
      switch (newDirection) {
        case 'UP':
          tempHead.y = (tempHead.y - 1 + gridSize) % gridSize;
          break;
        case 'DOWN':
          tempHead.y = (tempHead.y + 1) % gridSize;
          break;
        case 'LEFT':
          tempHead.x = (tempHead.x - 1 + gridSize) % gridSize;
          break;
        case 'RIGHT':
          tempHead.x = (tempHead.x + 1) % gridSize;
          break;
      }
      
      // If the predicted move would result in collision, try to find a safer direction
      if (wouldCollide(tempHead, snake, gameState)) {
        console.log(`Snake ${snake.id} avoiding collision, changing direction`);
        newDirection = findSafeDirection(snake, gameState, adjustedPredictions);
      }
    }
  }

  // Move in the chosen direction
  switch (newDirection) {
    case 'UP':
      newHead.y = (newHead.y - 1 + gridSize) % gridSize;
      break;
    case 'DOWN':
      newHead.y = (newHead.y + 1) % gridSize;
      break;
    case 'LEFT':
      newHead.x = (newHead.x - 1 + gridSize) % gridSize;
      break;
    case 'RIGHT':
      newHead.x = (newHead.x + 1) % gridSize;
      break;
  }

  // Create new positions array with the new head at index 0
  const newPositions = [newHead];
  for (let i = 0; i < positions.length - 1; i++) {
    newPositions.push({ ...positions[i] });
  }

  // Return updated snake
  return {
    ...snake,
    positions: newPositions,
    direction: newDirection
  };
};
