
/**
 * Deserialize weights from a flat array to input-hidden and hidden-output weight matrices
 */
export const deserializeWeights = (
  flat: number[], 
  inputSize: number, 
  hiddenSize: number, 
  outputSize: number
): { weightsInputHidden: number[][], weightsHiddenOutput: number[][] } => {
  let index = 0;
  
  // Initialize weight matrices
  const weightsInputHidden = Array(hiddenSize).fill(0).map(() => 
    Array(inputSize).fill(0).map(() => 0)
  );
  
  const weightsHiddenOutput = Array(outputSize).fill(0).map(() => 
    Array(hiddenSize).fill(0).map(() => 0)
  );
  
  // Deserialize input-hidden weights
  for (let i = 0; i < hiddenSize; i++) {
    for (let j = 0; j < inputSize; j++) {
      if (index < flat.length) {
        weightsInputHidden[i][j] = flat[index++];
      }
    }
  }
  
  // Deserialize hidden-output weights
  for (let i = 0; i < outputSize; i++) {
    for (let j = 0; j < hiddenSize; j++) {
      if (index < flat.length) {
        weightsHiddenOutput[i][j] = flat[index++];
      }
    }
  }

  return { weightsInputHidden, weightsHiddenOutput };
};

/**
 * Serialize weights from matrices to a flat array for storage
 */
export const serializeWeights = (
  weightsInputHidden: number[][], 
  weightsHiddenOutput: number[][]
): number[] => {
  const flat: number[] = [];
  
  // Flatten input-hidden weights
  weightsInputHidden.forEach(row => {
    row.forEach(weight => flat.push(weight));
  });
  
  // Flatten hidden-output weights
  weightsHiddenOutput.forEach(row => {
    row.forEach(weight => flat.push(weight));
  });
  
  return flat;
};

/**
 * Generates random initial weights for a neural network
 */
export const generateRandomWeights = (
  inputSize: number, 
  hiddenSize: number, 
  outputSize: number
): { weightsInputHidden: number[][], weightsHiddenOutput: number[][] } => {
  const weightsInputHidden = Array(hiddenSize).fill(0).map(() => 
    Array(inputSize).fill(0).map(() => Math.random() * 2 - 1)
  );
  
  const weightsHiddenOutput = Array(outputSize).fill(0).map(() => 
    Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1)
  );
  
  return { weightsInputHidden, weightsHiddenOutput };
};
