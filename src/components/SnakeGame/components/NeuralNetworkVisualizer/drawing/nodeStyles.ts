
// Calculate node color based on its activation value with pulsing effect
export const getNodeColor = (value: number, isInput: boolean): string => {
  // Add slight pulsing effect based on time
  const pulseEffect = (Math.sin(Date.now() / 500) * 0.1) + 0.9;
  const adjustedValue = Math.min(1, Math.max(0, value * pulseEffect));
  const intensity = Math.min(255, Math.max(0, Math.floor(adjustedValue * 255)));
  
  if (isInput) {
    // Input nodes: Red to Green spectrum with some blue
    const green = intensity;
    const red = 255 - intensity;
    const blue = 50;
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // Output nodes: Blue to Green spectrum with some red
    const green = intensity;
    const red = 100;
    const blue = 255 - intensity;
    return `rgb(${red}, ${green}, ${blue})`;
  }
};
