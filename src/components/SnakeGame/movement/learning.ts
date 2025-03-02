
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
    // Apply moderate learning with this correct decision
    // Using a more reasonable reward value to prevent overfitting
    const reward = 1.5;
    console.log(`Snake ${snake.id} learns from success when eating apple, reward=${reward}`);
    snake.brain.learn(true, snake.lastInputs, snake.lastOutputs, reward);
  } 
  else if (ignoreApple) {
    // If there's an apple, but it wasn't taken, apply moderate penalty
    console.log(`Snake ${snake.id} penalized for not taking available apple`);
    const penalty = 0.8;
    snake.brain.learn(false, snake.lastInputs, snake.lastOutputs || [], penalty);
  }
};
