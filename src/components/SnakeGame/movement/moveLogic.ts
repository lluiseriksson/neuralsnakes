
import { Snake, Position, Direction, GameState } from "../types";
import { GRID_SIZE } from "../constants";
import { isOppositeDirection } from "./directionUtils";
import { wouldCollide } from "./collision";
import { isAppleInDirection } from "./appleDetection";

// Function to find a safe direction when the snake is in danger of collision
const findSafeDirection = (snake: Snake, gameState: GameState, currentPrediction: number[]): Direction => {
  if (!snake.positions || snake.positions.length === 0) return snake.direction;
  
  const head = snake.positions[0];
  const gridSize = snake.gridSize || GRID_SIZE;
  
  // Define all possible directions and their corresponding new heads
  const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
  const newHeads: {direction: Direction, head: Position, score: number, hasApple: boolean}[] = [
    { 
      direction: 'UP', 
      head: { x: head.x, y: (head.y - 1 + gridSize) % gridSize },
      score: currentPrediction[0] || 0,
      hasApple: isAppleInDirection(head, 'UP', gameState, gridSize)
    },
    { 
      direction: 'RIGHT', 
      head: { x: (head.x + 1) % gridSize, y: head.y },
      score: currentPrediction[1] || 0,
      hasApple: isAppleInDirection(head, 'RIGHT', gameState, gridSize)
    },
    { 
      direction: 'DOWN', 
      head: { x: head.x, y: (head.y + 1) % gridSize },
      score: currentPrediction[2] || 0,
      hasApple: isAppleInDirection(head, 'DOWN', gameState, gridSize)
    },
    { 
      direction: 'LEFT', 
      head: { x: (head.x - 1 + gridSize) % gridSize, y: head.y },
      score: currentPrediction[3] || 0,
      hasApple: isAppleInDirection(head, 'LEFT', gameState, gridSize)
    }
  ];
  
  // Filter out opposite direction
  const possibleMoves = newHeads.filter(move => !isOppositeDirection(snake.direction, move.direction));
  
  // Check which moves are safe (don't result in collision)
  let safeMoves = possibleMoves.filter(move => !wouldCollide(move.head, snake, gameState));
  
  // Prioritize safe moves with apples
  const safeMovesWithApples = safeMoves.filter(move => move.hasApple);
  if (safeMovesWithApples.length > 0) {
    // Choose the safe move with apple that has the highest score
    safeMovesWithApples.sort((a, b) => b.score - a.score);
    return safeMovesWithApples[0].direction;
  }
  
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
  
  // Initialize movesWithoutEating if it doesn't exist
  if (snake.movesWithoutEating === undefined) {
    snake.movesWithoutEating = 0;
  } else {
    snake.movesWithoutEating++;
  }
  
  // Initialize decision metrics if they don't exist
  if (!snake.decisionMetrics) {
    snake.decisionMetrics = {
      applesEaten: 0,
      applesIgnored: 0,
      badDirections: 0,
      goodDirections: 0
    };
  }
  
  // Make a deep copy of positions to avoid accidental modifications
  const positions = [...snake.positions.map(pos => ({ ...pos }))];
  const head = positions[0];
  let newHead = { ...head };
  let newDirection = snake.direction;
  
  // Use the snake's gridSize or fall back to GRID_SIZE constant
  const gridSize = snake.gridSize || GRID_SIZE;

  // STEP 1: Look for adjacent apples, this is the highest priority
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
  
  // Filter apple directions that are not opposite and don't have obstacles
  const safeAppleDirections = adjacentApples.filter(cell => 
    !isOppositeDirection(snake.direction, cell.dir) && 
    !adjacentObstacles.some(obstacle => 
      obstacle.pos.x === cell.pos.x && obstacle.pos.y === cell.pos.y
    )
  );
  
  // MAIN DECISION: Go towards an adjacent apple if it's safe
  if (safeAppleDirections.length > 0) {
    // Adjacent apple available and safe - highest priority
    newDirection = safeAppleDirections[0].dir;
    console.log(`Snake ${snake.id} chose to eat adjacent apple in direction ${newDirection}`);
    snake.decisionMetrics.applesEaten++;
    
    // Apply intense learning with this correct decision
    if (snake.lastInputs && snake.lastOutputs) {
      const reward = 3.0; // Very high reward for eating apple
      console.log(`Snake ${snake.id} learns from success when eating apple, reward=${reward}`);
      snake.brain.learn(true, snake.lastInputs, snake.lastOutputs, reward);
    }
  } 
  // If there are adjacent apples but they're blocked, record them
  else if (adjacentApples.length > 0) {
    snake.decisionMetrics.applesIgnored++;
    console.log(`Snake ${snake.id} ignored blocked apple`);
  }
  // Use neural network model only if there are no safe adjacent apples
  else if (predictions && predictions.length === 4) {
    // Store current inputs for later learning
    if (snake.lastInputs) {
      // If there's an apple, but it wasn't taken, negative learning
      if (adjacentApples.length > 0) {
        console.log(`Snake ${snake.id} penalized for not taking available apple`);
        const penalty = 1.5;
        snake.brain.learn(false, snake.lastInputs, snake.lastOutputs || [], penalty);
      }
    }
    
    // Find the direction with the highest prediction value that isn't dangerous
    const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    
    // Sort directions by prediction value (highest to lowest)
    const sortedPredictions = directions.map((dir, index) => ({
      direction: dir,
      value: predictions[index],
      isOpposite: isOppositeDirection(snake.direction, dir),
      isObstacle: adjacentObstacles.some(obs => obs.dir === dir)
    })).sort((a, b) => b.value - a.value);
    
    // First try the most promising direction if it's safe
    for (const pred of sortedPredictions) {
      if (!pred.isOpposite && !pred.isObstacle) {
        newDirection = pred.direction;
        if (pred.value > 0.6) {
          snake.decisionMetrics.goodDirections++;
        } else {
          snake.decisionMetrics.badDirections++;
        }
        break;
      }
    }
    
    // If all directions are dangerous, choose the least bad one
    if (newDirection === snake.direction && sortedPredictions.length > 0) {
      // First avoid opposite directions
      const nonOppositeChoices = sortedPredictions.filter(p => !p.isOpposite);
      if (nonOppositeChoices.length > 0) {
        newDirection = nonOppositeChoices[0].direction;
      } else {
        // If all are opposite, choose the one with the highest value
        newDirection = sortedPredictions[0].direction;
      }
      console.log(`Snake ${snake.id} chose dangerous direction: ${newDirection}`);
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

  // Return updated snake with the chosen outputs for learning
  const directionIndex = ['UP', 'RIGHT', 'DOWN', 'LEFT'].indexOf(newDirection);
  const outputs = [0, 0, 0, 0];
  if (directionIndex >= 0) {
    outputs[directionIndex] = 1;
  }

  // Save current inputs for learning
  const inputs = [...(snake.lastInputs || [])];

  return {
    ...snake,
    positions: newPositions,
    direction: newDirection,
    lastOutputs: outputs,  // Save outputs for learning
    lastInputs: inputs,    // Save inputs for learning
    movesWithoutEating: snake.movesWithoutEating,
    decisionMetrics: snake.decisionMetrics
  };
};
