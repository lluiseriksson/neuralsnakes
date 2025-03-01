
/**
 * Sigmoid activation function
 */
export const sigmoid = (x: number): number => {
  return 1 / (1 + Math.exp(-x));
};

/**
 * ReLU activation function (for potential future use)
 */
export const relu = (x: number): number => {
  return Math.max(0, x);
};

/**
 * Tanh activation function (for potential future use)
 */
export const tanh = (x: number): number => {
  return Math.tanh(x);
};
