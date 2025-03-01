
import { Position, Apple } from '../../types';

/**
 * Calculates the closest apple to a snake's head
 */
export const findClosestApple = (head: Position, apples: Apple[]): Apple => {
  if (!apples.length) {
    console.error("No apples found when looking for closest apple");
    // Return a default apple position if no apples exist
    return { position: { x: 0, y: 0 } };
  }
  
  let closestApple = apples[0];
  let minDistance = Number.MAX_VALUE;
  
  for (const apple of apples) {
    // Using Manhattan distance (more relevant for grid movement)
    const distance = Math.abs(head.x - apple.position.x) + Math.abs(head.y - apple.position.y);
    if (distance < minDistance) {
      minDistance = distance;
      closestApple = apple;
    }
  }
  
  return closestApple;
};

/**
 * Calculates direction vectors from head to target with distance weighting
 * Ahora con señales más fuertes para manzanas cercanas
 */
export const calculateDirectionVectors = (head: Position, target: Position, gridSize: number): number[] => {
  // Direction vectors [UP, RIGHT, DOWN, LEFT]
  const directionVectors = [0, 0, 0, 0];
  
  // Calculate normalized direction to apple
  const dx = target.x - head.x;
  const dy = target.y - head.y;
  
  // Account for wraparound in grid
  const directDx = dx;
  const wraparoundDx = dx > 0 ? dx - gridSize : dx + gridSize;
  const directDy = dy;
  const wraparoundDy = dy > 0 ? dy - gridSize : dy + gridSize;
  
  // Choose the shorter path (direct or wraparound)
  const effectiveDx = Math.abs(directDx) <= Math.abs(wraparoundDx) ? directDx : wraparoundDx;
  const effectiveDy = Math.abs(directDy) <= Math.abs(wraparoundDy) ? directDy : wraparoundDy;
  
  // Calculate Manhattan distance
  const manhattanDistance = Math.abs(effectiveDx) + Math.abs(effectiveDy);
  
  // Calculate distance weight - now with stronger signal for closer apples
  // Weightings: 1.0 for adjacent, 0.9 for 2 steps, 0.8 for 3 steps, etc.
  const distanceWeight = Math.max(0.3, 1.0 - (manhattanDistance / (gridSize * 1.5)) * 0.7);
  
  // Signal boost for very close apples (within 3 steps)
  const proximityBoost = manhattanDistance <= 3 ? (4 - manhattanDistance) * 0.2 : 0;
  const finalWeight = distanceWeight + proximityBoost;
  
  // Set direction vectors based on the relative position with adjusted weighting
  if (effectiveDy < 0) directionVectors[0] = Math.min(1, finalWeight * 1.2); // UP - slightly favor vertical/horizontal
  if (effectiveDx > 0) directionVectors[1] = Math.min(1, finalWeight * 1.2); // RIGHT
  if (effectiveDy > 0) directionVectors[2] = Math.min(1, finalWeight * 1.2); // DOWN
  if (effectiveDx < 0) directionVectors[3] = Math.min(1, finalWeight * 1.2); // LEFT
  
  return directionVectors;
};

/**
 * Verifica si hay una manzana en alguna dirección cercana (1-3 pasos)
 * para generar señales directas sobre manzanas cercanas
 */
export const detectNearbyApples = (head: Position, apples: Apple[], gridSize: number): number[] => {
  // Initialize directional apple signals [UP, RIGHT, DOWN, LEFT]
  const appleSignals = [0, 0, 0, 0];
  
  // Look-ahead positions for apple detection (3 steps in each direction)
  const lookAheadPositions = [
    // UP: 1, 2, 3 steps
    [
      { x: head.x, y: (head.y - 1 + gridSize) % gridSize },
      { x: head.x, y: (head.y - 2 + gridSize) % gridSize },
      { x: head.x, y: (head.y - 3 + gridSize) % gridSize }
    ],
    // RIGHT: 1, 2, 3 steps
    [
      { x: (head.x + 1) % gridSize, y: head.y },
      { x: (head.x + 2) % gridSize, y: head.y },
      { x: (head.x + 3) % gridSize, y: head.y }
    ],
    // DOWN: 1, 2, 3 steps
    [
      { x: head.x, y: (head.y + 1) % gridSize },
      { x: head.x, y: (head.y + 2) % gridSize },
      { x: head.x, y: (head.y + 3) % gridSize }
    ],
    // LEFT: 1, 2, 3 steps
    [
      { x: (head.x - 1 + gridSize) % gridSize, y: head.y },
      { x: (head.x - 2 + gridSize) % gridSize, y: head.y },
      { x: (head.x - 3 + gridSize) % gridSize, y: head.y }
    ]
  ];
  
  // Search for apples in each direction
  for (const apple of apples) {
    for (let dir = 0; dir < 4; dir++) {
      for (let step = 0; step < 3; step++) {
        const position = lookAheadPositions[dir][step];
        if (position.x === apple.position.x && position.y === apple.position.y) {
          // Señal MUCHO más fuerte para manzanas cercanas: 
          // 1.0 para 1 paso (manzana inmediata), 0.85 para 2 pasos, 0.7 para 3 pasos
          const strength = 1.0 - (step * 0.15);
          // Update if stronger signal
          if (strength > appleSignals[dir]) {
            appleSignals[dir] = strength;
          }
          break; // Once we found an apple in this direction at a particular step, no need to check further steps
        }
      }
    }
  }
  
  // Boost signals for immediate apples (1 step away) to make them much more enticing
  for (let dir = 0; dir < 4; dir++) {
    const immediatePos = lookAheadPositions[dir][0];
    if (apples.some(apple => apple.position.x === immediatePos.x && apple.position.y === immediatePos.y)) {
      appleSignals[dir] = 1.0; // Máxima señal para manzanas inmediatas
    }
  }
  
  return appleSignals;
};
