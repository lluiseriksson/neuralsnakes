import { Direction, Snake } from '../../types';
import { generateInitialSnake } from '../../movement/initialSnake';
import { createBestModelBrain, createCombinedModelBrain, createRandomBrain } from './createSnakeBrain';
import { getModelCache, forceGenerationUpdate, getCurrentGeneration } from './modelCache';

// Maximum generation cap to prevent display issues
const MAX_GENERATION = 100;

export const createSnake = async (id: number, x: number, y: number, direction: Direction, color: string): Promise<Snake> => {
  try {
    console.log(`Creating snake ${id} at position (${x},${y}) with color ${color}`);
    let brain;
    
    // Get current generation to ensure all snakes start with at least this generation
    // Apply cap to prevent extremely high values
    const currentGlobalGeneration = Math.min(getCurrentGeneration(), MAX_GENERATION);
    console.log(`Current global generation (capped): ${currentGlobalGeneration}`);
    
    // Select the appropriate brain creation strategy based on snake ID
    if (id === 0) {
      // Yellow snake - best model brain
      console.log(`🟡 Creating YELLOW SNAKE ${id} with color ${color} 🟡`);
      brain = await createBestModelBrain().catch(error => {
        console.error(`Error creating best model brain: ${error.message}`);
        return createRandomBrain(id);
      });
      
      // Force yellow snake to have the same generation as others
      // but stay within reasonable limits
      const yellowGeneration = Math.min(
        Math.max(brain.getGeneration(), currentGlobalGeneration),
        MAX_GENERATION
      );
      brain.updateGeneration(yellowGeneration);
      console.log(`🟡 YELLOW SNAKE GENERATION SET TO: ${brain.getGeneration()} 🟡`);
      
      // Force global generation update from yellow snake
      forceGenerationUpdate(yellowGeneration);
    } else if (id === 1) {
      // Blue snake - combined model brain
      console.log(`🔵 Creating BLUE SNAKE ${id} with color ${color} 🔵`);
      brain = await createCombinedModelBrain().catch(error => {
        console.error(`Error creating combined model brain: ${error.message}`);
        return createRandomBrain(id);
      });
      
      // Force blue snake to same generation as global
      const blueGeneration = Math.min(currentGlobalGeneration, MAX_GENERATION);
      brain.updateGeneration(blueGeneration);
      console.log(`🔵 BLUE SNAKE GENERATION SET TO: ${brain.getGeneration()} 🔵`);
    } else {
      // Other snakes - random brains
      console.log(`🟢 Creating RANDOM SNAKE ${id} with color ${color} 🟢`);
      brain = createRandomBrain(id);
      
      // Enforce same generation for all other snakes
      const randomGeneration = Math.min(currentGlobalGeneration, MAX_GENERATION);
      brain.updateGeneration(randomGeneration);
      console.log(`🟢 RANDOM SNAKE ${id} GENERATION SET TO: ${brain.getGeneration()} 🟢`);
    }

    if (!brain) {
      console.error(`Failed to create brain for snake ${id}, creating fallback random brain`);
      brain = createRandomBrain(id);
      
      // Ensure fallback brain gets current generation
      const globalGen = Math.min(getCurrentGeneration(), MAX_GENERATION);
      brain.updateGeneration(globalGen);
      console.log(`⚠️ FALLBACK SNAKE ${id} GENERATION SET TO: ${brain.getGeneration()} ⚠️`);
    }

    // Double-check brain has a valid generation
    console.log(`Final snake ${id} generation: ${brain.getGeneration()}`);

    // Generate initial positions with safety check
    let positions = generateInitialSnake(x, y);
    
    // Verify positions are valid
    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      console.error(`Error generating initial positions for snake ${id}, using fallback`);
      // Create simple initial positions as fallback
      positions = [
        { x, y },
        { x, y: y + 1 },
        { x, y: y + 2 }
      ];
      console.log(`Using fallback positions for snake ${id}`);
    }
    
    // Verify each position is valid
    for (let i = 0; i < positions.length; i++) {
      if (typeof positions[i].x !== 'number' || typeof positions[i].y !== 'number') {
        console.error(`Invalid position at index ${i} for snake ${id}, fixing`);
        positions[i] = { x: x + i, y };
      }
    }
    
    // Initialize enhanced decision metrics for better analysis
    const decisionMetrics = {
      applesEaten: 0,
      applesIgnored: 0,
      badDirections: 0,
      goodDirections: 0,
      killCount: 0,
      suicides: 0,
      effectiveDecisions: 0,
      ineffectiveDecisions: 0,
      survivalTime: 0
    };
    
    console.log(`Snake ${id} created at (${x}, ${y}) with ${positions.length} segments and generation ${brain.getGeneration()}`);

    return {
      id,
      positions,
      direction,
      color,
      score: 0,
      brain,
      alive: true,
      gridSize: 30,
      movesWithoutEating: 0,
      decisionMetrics,
      generation: brain.getGeneration(), // Add generation
      age: 0 // Add age starting at 0
    };
  } catch (error) {
    console.error(`Error creating snake ${id}:`, error);
    // Create a snake with default values in case of error
    const fallbackPositions = [
      { x, y },
      { x, y: y + 1 },
      { x, y: y + 2 }
    ];
    console.log(`Creating fallback snake for ${id}`);
    
    // Create fallback brain
    const fallbackBrain = createRandomBrain(id);
    
    // Ensure fallback brain has the current global generation
    const globalGen = Math.min(getCurrentGeneration(), MAX_GENERATION);
    fallbackBrain.updateGeneration(globalGen);
    console.log(`⚠️ FALLBACK SNAKE ${id} GENERATION SET TO: ${fallbackBrain.getGeneration()} ⚠️`);
    
    return {
      id,
      positions: fallbackPositions,
      direction,
      color,
      score: 0,
      brain: fallbackBrain,
      alive: true,
      gridSize: 30,
      movesWithoutEating: 0,
      decisionMetrics: {
        applesEaten: 0,
        applesIgnored: 0,
        badDirections: 0,
        goodDirections: 0,
        killCount: 0,
        suicides: 0,
        effectiveDecisions: 0,
        ineffectiveDecisions: 0,
        survivalTime: 0
      },
      generation: globalGen, // Add generation
      age: 0 // Add age starting at 0
    };
  }
};
