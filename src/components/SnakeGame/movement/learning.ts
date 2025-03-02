
import { Snake } from "../types";

// Helper function for neural network learning
export const applyReinforcementLearning = (
  snake: Snake, 
  ateApple: boolean, 
  ignoreApple: boolean
): void => {
  // Skip if no learning data is available
  if (!snake.lastInputs || !snake.lastOutputs) return;
  
  if (ateApple) {
    // Apply intense learning with this correct decision
    const reward = 3.0; // Very high reward for eating apple
    console.log(`Snake ${snake.id} learns from success when eating apple, reward=${reward}`);
    snake.brain.learn(true, snake.lastInputs, snake.lastOutputs, reward);
  } 
  else if (ignoreApple) {
    // If there's an apple, but it wasn't taken, negative learning
    console.log(`Snake ${snake.id} penalized for not taking available apple`);
    const penalty = 1.5;
    snake.brain.learn(false, snake.lastInputs, snake.lastOutputs || [], penalty);
  }
};
