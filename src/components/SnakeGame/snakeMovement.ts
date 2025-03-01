
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

// Función para determinar si hay una manzana en la dirección elegida
const isAppleInDirection = (head: Position, direction: Direction, gameState: GameState, gridSize: number): boolean => {
  let checkPos: Position;
  
  // Calcular la posición a verificar basada en la dirección
  switch (direction) {
    case 'UP':
      checkPos = { x: head.x, y: (head.y - 1 + gridSize) % gridSize };
      break;
    case 'RIGHT':
      checkPos = { x: (head.x + 1) % gridSize, y: head.y };
      break;
    case 'DOWN':
      checkPos = { x: head.x, y: (head.y + 1) % gridSize };
      break;
    case 'LEFT':
      checkPos = { x: (head.x - 1 + gridSize) % gridSize, y: head.y };
      break;
  }
  
  // Verificar si hay una manzana en la nueva posición
  return gameState.apples.some(apple => 
    apple.position.x === checkPos.x && apple.position.y === checkPos.y
  );
};

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
  
  // Si hay movimientos seguros con manzanas, priorizar esos
  const safeMovesWithApples = safeMoves.filter(move => move.hasApple);
  if (safeMovesWithApples.length > 0) {
    // Elegir el movimiento seguro con manzana de mayor puntaje
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
  
  // Make a deep copy of positions to avoid accidental modifications
  const positions = [...snake.positions.map(pos => ({ ...pos }))];
  const head = positions[0];
  let newHead = { ...head };
  let newDirection = snake.direction;
  
  // Use the snake's gridSize or fall back to GRID_SIZE constant
  const gridSize = snake.gridSize || GRID_SIZE;

  if (predictions && predictions.length === 4) {
    // Use neural network predictions for movement
    // Reduced randomness for more deterministic behavior
    const randomFactor = 0.02; // Reduced from 0.05 for more deterministic behavior
    
    // Apply apple detection for immediate apple priority
    // Check if there's an apple in any adjacent cell
    const adjacentApples: {direction: Direction, hasApple: boolean}[] = [
      { direction: 'UP', hasApple: isAppleInDirection(head, 'UP', gameState, gridSize) },
      { direction: 'RIGHT', hasApple: isAppleInDirection(head, 'RIGHT', gameState, gridSize) },
      { direction: 'DOWN', hasApple: isAppleInDirection(head, 'DOWN', gameState, gridSize) },
      { direction: 'LEFT', hasApple: isAppleInDirection(head, 'LEFT', gameState, gridSize) }
    ];
    
    // Check if there's an apple in any direction where we can move (not opposite to current)
    const possibleAppleDirections = adjacentApples.filter(d => 
      d.hasApple && !isOppositeDirection(snake.direction, d.direction)
    );
    
    if (possibleAppleDirections.length > 0) {
      // Si hay una manzana adyacente, muévete hacia ella independientemente de las predicciones
      newDirection = possibleAppleDirections[0].direction;
      
      // Si habría colisión, busca otra dirección
      let wouldHaveCollision = false;
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
      
      wouldHaveCollision = wouldCollide(tempHead, snake, gameState);
      
      if (wouldHaveCollision) {
        // If moving toward the apple would cause collision, use neural network
        // with boosted weights for apple directions
        const adjustedPredictions = [...predictions];
        // Find index of apple direction and boost its prediction value
        const dirIndex = ['UP', 'RIGHT', 'DOWN', 'LEFT'].indexOf(newDirection);
        if (dirIndex >= 0 && dirIndex < 4) {
          // Use normal neural network decision but with slightly random adjustment
          const adjustedPredictions = predictions.map(p => p + Math.random() * randomFactor);
          newDirection = findSafeDirection(snake, gameState, adjustedPredictions);
        }
      }
    } else {
      // No adjacent apples - use neural network with slightly random adjustment
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
      } else {
        // Si la dirección elegida es opuesta, usar la función findSafeDirection
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

  // Return updated snake with the chosen outputs for learning
  const directionIndex = ['UP', 'RIGHT', 'DOWN', 'LEFT'].indexOf(newDirection);
  const outputs = [0, 0, 0, 0];
  if (directionIndex >= 0) {
    outputs[directionIndex] = 1;
  }

  return {
    ...snake,
    positions: newPositions,
    direction: newDirection,
    lastOutputs: outputs  // Add this to snake for learning purposes
  };
};
