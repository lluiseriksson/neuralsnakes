
// Calculate node color based on its activation value with pulsing effect
export const getNodeColor = (value: number, isInput: boolean): string => {
  // Add slight pulsing effect based on time
  const pulseEffect = (Math.sin(Date.now() / 500) * 0.1) + 0.9;
  const adjustedValue = Math.min(1, Math.max(0, Math.abs(value) * pulseEffect));
  const intensity = Math.min(255, Math.max(0, Math.floor(adjustedValue * 255)));
  
  if (isInput) {
    if (value < 0) {
      // Negative input: reddish
      const red = 200 + Math.floor(intensity * 0.2);
      const green = 50 + Math.floor(intensity * 0.2);
      const blue = 50;
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Positive input: greenish
      const red = 50;
      const green = 150 + Math.floor(intensity * 0.4);
      const blue = 50 + Math.floor(intensity * 0.2);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  } else {
    // Output nodes: blue to yellow spectrum
    const red = 100 + Math.floor(intensity * 0.6);
    const green = 100 + Math.floor(intensity * 0.6);
    const blue = 200 - Math.floor(intensity * 0.5);
    return `rgb(${red}, ${green}, ${blue})`;
  }
};
