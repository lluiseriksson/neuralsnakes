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

  // PASO 1: Buscar manzanas adyacentes, esta es la máxima prioridad
  const adjacentCells = [
    { pos: { x: head.x, y: (head.y - 1 + gridSize) % gridSize }, dir: 'UP' as Direction },
    { pos: { x: (head.x + 1) % gridSize, y: head.y }, dir: 'RIGHT' as Direction },
    { pos: { x: head.x, y: (head.y + 1) % gridSize }, dir: 'DOWN' as Direction },
    { pos: { x: (head.x - 1 + gridSize) % gridSize, y: head.y }, dir: 'LEFT' as Direction }
  ];
  
  // Identificar celdas con manzanas
  const adjacentApples = adjacentCells.filter(cell => 
    gameState.apples.some(apple => 
      apple.position.x === cell.pos.x && apple.position.y === cell.pos.y
    )
  );
  
  // Identificar celdas con obstáculos (otras serpientes o a sí misma)
  const adjacentObstacles = adjacentCells.filter(cell => {
    // Evitar colisión con cualquier segmento de cualquier serpiente (incluida ella misma)
    for (const otherSnake of gameState.snakes) {
      if (!otherSnake.alive) continue;
      
      for (let i = 0; i < otherSnake.positions.length; i++) {
        // Si es la propia serpiente, no evitar la cola (último segmento) pues se moverá
        if (otherSnake.id === snake.id && i === otherSnake.positions.length - 1) continue;
        
        if (cell.pos.x === otherSnake.positions[i].x && cell.pos.y === otherSnake.positions[i].y) {
          return true;
        }
      }
    }
    return false;
  });
  
  // Filtrar direcciones de manzanas que no sean opuestas y no tengan obstáculos
  const safeAppleDirections = adjacentApples.filter(cell => 
    !isOppositeDirection(snake.direction, cell.dir) && 
    !adjacentObstacles.some(obstacle => 
      obstacle.pos.x === cell.pos.x && obstacle.pos.y === cell.pos.y
    )
  );
  
  // DECISIÓN PRINCIPAL: Ir hacia una manzana adyacente si es seguro
  if (safeAppleDirections.length > 0) {
    // Manzana adyacente disponible y segura - máxima prioridad
    newDirection = safeAppleDirections[0].dir;
    console.log(`Snake ${snake.id} eligió comer manzana adyacente en dirección ${newDirection}`);
    snake.decisionMetrics.applesEaten++;
    
    // Aplicar aprendizaje intenso con esta decisión correcta
    if (snake.lastInputs && snake.lastOutputs) {
      const reward = 3.0; // Recompensa muy alta por comer manzana
      console.log(`Snake ${snake.id} aprende de éxito al comer manzana, reward=${reward}`);
      snake.brain.learn(true, snake.lastInputs, snake.lastOutputs, reward);
    }
  } 
  // Si hay manzanas adyacentes pero están bloqueadas, registrarlas
  else if (adjacentApples.length > 0) {
    snake.decisionMetrics.applesIgnored++;
    console.log(`Snake ${snake.id} ignoró manzana bloqueada`);
  }
  // Usar el modelo neuronal solo si no hay manzanas adyacentes seguras
  else if (predictions && predictions.length === 4) {
    // Almacenar inputs actuales para aprendizaje posterior
    if (snake.lastInputs) {
      // Si hay manzana, pero no la tomó, aprendizaje negativo
      if (adjacentApples.length > 0) {
        console.log(`Snake ${snake.id} penalizada por no tomar manzana disponible`);
        const penalty = 1.5;
        snake.brain.learn(false, snake.lastInputs, snake.lastOutputs || [], penalty);
      }
    }
    
    // Encontrar la dirección con mayor valor de predicción que no sea peligrosa
    const directions: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    
    // Ordenar direcciones por valor de predicción (mayor a menor)
    const sortedPredictions = directions.map((dir, index) => ({
      direction: dir,
      value: predictions[index],
      isOpposite: isOppositeDirection(snake.direction, dir),
      isObstacle: adjacentObstacles.some(obs => obs.dir === dir)
    })).sort((a, b) => b.value - a.value);
    
    // Primero intentar la dirección más prometedora si es segura
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
    
    // Si todas las direcciones son peligrosas, elegir la menos mala
    if (newDirection === snake.direction && sortedPredictions.length > 0) {
      // Primero evitar direcciones opuestas
      const nonOppositeChoices = sortedPredictions.filter(p => !p.isOpposite);
      if (nonOppositeChoices.length > 0) {
        newDirection = nonOppositeChoices[0].direction;
      } else {
        // Si todas son opuestas, elegir la de mayor valor
        newDirection = sortedPredictions[0].direction;
      }
      console.log(`Snake ${snake.id} eligió dirección peligrosa: ${newDirection}`);
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

  // Guardar inputs actuales para aprendizaje
  const inputs = [...(snake.lastInputs || [])];

  return {
    ...snake,
    positions: newPositions,
    direction: newDirection,
    lastOutputs: outputs,  // Guardar outputs para aprendizaje
    lastInputs: inputs,    // Guardar inputs para aprendizaje
    movesWithoutEating: snake.movesWithoutEating,
    decisionMetrics: snake.decisionMetrics
  };
};
