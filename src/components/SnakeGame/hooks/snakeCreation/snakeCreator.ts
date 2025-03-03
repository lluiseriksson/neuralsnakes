
import { Direction, Snake } from '../../types';
import { generateInitialSnake } from '../../movement/initialSnake';
import { createBestModelBrain, createCombinedModelBrain, createRandomBrain } from './createSnakeBrain';
import { getModelCache, forceGenerationUpdate, getCurrentGeneration } from './modelCache';

export const createSnake = async (id: number, x: number, y: number, direction: Direction, color: string): Promise<Snake> => {
  try {
    console.log(`Creating snake ${id} at position (${x},${y}) with color ${color}`);
    let brain;
    
    // Get current generation to ensure all snakes start with at least this generation
    const currentGlobalGeneration = getCurrentGeneration();
    console.log(`Current global generation: ${currentGlobalGeneration}`);
    
    // Select the appropriate brain creation strategy based on snake ID
    if (id === 0) {
      // Yellow snake - best model brain with enhanced capabilities
      console.log(`⭐ Creating YELLOW SNAKE ${id} with color ${color} ⭐`);
      brain = await createBestModelBrain().catch(error => {
        console.error(`Error creating best model brain: ${error.message}`);
        return createRandomBrain(id);
      });
      
      // Log the generation of yellow snake for debugging
      console.log(`⭐ YELLOW SNAKE GENERATION CHECK: ${brain.getGeneration()} ⭐`);
      
      // Force yellow snake to use at least the current global generation
      if (brain.getGeneration() < currentGlobalGeneration) {
        console.log(`⚠️ Yellow snake generation (${brain.getGeneration()}) is lower than global (${currentGlobalGeneration}). Fixing...`);
        brain.updateGeneration(currentGlobalGeneration);
      }
      
      // Force significant generation update from yellow snake to spread to other snakes
      const yellowSnakeGeneration = brain.getGeneration();
      if (yellowSnakeGeneration > 0) {
        // Add +15 to force significantly higher generations
        const newGeneration = yellowSnakeGeneration + 15;
        console.log(`⚡ YELLOW SNAKE is forcing global generation to ${newGeneration} ⚡`);
        forceGenerationUpdate(newGeneration);
      }
    } else if (id === 1) {
      // Blue snake - combined model brain with experimental variations
      console.log(`Creating combined model brain for blue snake ${id}`);
      brain = await createCombinedModelBrain().catch(error => {
        console.error(`Error creating combined model brain: ${error.message}`);
        return createRandomBrain(id);
      });
      
      // Apply extra mutations to blue snake for exploration
      if (brain) {
        console.log(`Applying additional mutations to blue snake for exploratory learning`);
        brain.mutate(0.3); // Higher mutation rate for exploration
        
        // Ensure blue snake gets at least current generation
        if (brain.getGeneration() < currentGlobalGeneration) {
          console.log(`⚠️ Blue snake generation (${brain.getGeneration()}) is lower than global (${currentGlobalGeneration}). Fixing...`);
          brain.updateGeneration(currentGlobalGeneration);
        }
      }
    } else {
      // Other snakes - random brains with various learning strategies
      console.log(`Creating specialized random brain for snake ${id}`);
      brain = createRandomBrain(id);
      
      // Ensure random snakes get at least current generation
      if (brain.getGeneration() < currentGlobalGeneration) {
        console.log(`⚠️ Snake ${id} generation (${brain.getGeneration()}) is lower than global (${currentGlobalGeneration}). Fixing...`);
        brain.updateGeneration(currentGlobalGeneration);
      }
      
      // Apply different mutation strategies based on snake ID for diversity
      if (brain) {
        // Even IDs get more mutations, odd IDs get less
        const specializedRate = id % 2 === 0 ? 0.4 : 0.2;
        brain.mutate(specializedRate);
        console.log(`Applied specialized mutation rate ${specializedRate} to snake ${id}`);
      }
    }

    if (!brain) {
      console.error(`Failed to create brain for snake ${id}, creating fallback random brain`);
      brain = createRandomBrain(id);
      
      // Ensure fallback brain gets at least current generation
      if (brain.getGeneration() < currentGlobalGeneration) {
        brain.updateGeneration(currentGlobalGeneration);
      }
    }

    // Double-check brain has a valid generation equal to at least the current global generation
    if (brain.getGeneration() < currentGlobalGeneration) {
      console.log(`⚠️ Final check: Snake ${id} generation (${brain.getGeneration()}) is still lower than global (${currentGlobalGeneration}). Fixing...`);
      brain.updateGeneration(currentGlobalGeneration);
    }

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
      decisionMetrics
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
    
    // Ensure fallback brain has a valid generation - use current global generation
    const currentGlobalGeneration = getCurrentGeneration();
    fallbackBrain.updateGeneration(currentGlobalGeneration);
    
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
      }
    };
  }
};
