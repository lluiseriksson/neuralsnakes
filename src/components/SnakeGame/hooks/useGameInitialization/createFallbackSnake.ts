
import { Direction, Snake } from '../../types';
import { GRID_SIZE } from '../../constants';
import { createFallbackBrain } from './createFallbackBrain';

export const createFallbackSnake = (id: number, spawnX: number, spawnY: number, direction: Direction, color: string): Snake => {
  // Validate input parameters
  const validX = Math.min(Math.max(0, spawnX), GRID_SIZE - 1);
  const validY = Math.min(Math.max(0, spawnY), GRID_SIZE - 1);
  const validDirection = ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(direction) ? direction : 'RIGHT';
  const validColor = color || ['#FFDD00', 'blue', 'green', '#9b87f5'][id % 4];
  
  console.log(`Creating fallback snake ${id} at (${validX},${validY}) with direction ${validDirection} and color ${validColor}`);
  
  // Create a fallback brain
  const fallbackBrain = createFallbackBrain();
  
  // Generate positions with proper spacing to avoid immediate self-collision
  const positions = [];
  
  // Add head position
  positions.push({x: validX, y: validY});
  
  // Add body segments based on direction
  switch (validDirection) {
    case 'UP':
      positions.push({x: validX, y: validY + 1});
      positions.push({x: validX, y: validY + 2});
      break;
    case 'DOWN':
      positions.push({x: validX, y: validY - 1});
      positions.push({x: validX, y: validY - 2});
      break;
    case 'LEFT':
      positions.push({x: validX + 1, y: validY});
      positions.push({x: validX + 2, y: validY});
      break;
    case 'RIGHT':
      positions.push({x: validX - 1, y: validY});
      positions.push({x: validX - 2, y: validY});
      break;
    default:
      // Fallback to RIGHT direction
      positions.push({x: validX - 1, y: validY});
      positions.push({x: validX - 2, y: validY});
  }
  
  // Ensure all positions are within grid bounds
  positions.forEach(pos => {
    pos.x = Math.min(Math.max(0, pos.x), GRID_SIZE - 1);
    pos.y = Math.min(Math.max(0, pos.y), GRID_SIZE - 1);
  });

  return {
    id,
    positions,
    direction: validDirection,
    color: validColor,
    score: 0,
    brain: fallbackBrain,
    alive: true,
    gridSize: GRID_SIZE,
    movesWithoutEating: 0,
    decisionMetrics: {
      applesEaten: 0,
      applesIgnored: 0,
      badDirections: 0,
      goodDirections: 0
    },
    generation: 1, // Add generation
    age: 0 // Add age
  };
};
