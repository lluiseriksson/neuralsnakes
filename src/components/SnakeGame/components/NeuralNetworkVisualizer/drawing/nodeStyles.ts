
// Calculate node color based on its activation value with pulsing effect
export const getNodeColor = (value: number, isInput: boolean): string => {
  // Add slight pulsing effect based on time
  const pulseEffect = (Math.sin(Date.now() / 400) * 0.15) + 0.9;
  const adjustedValue = Math.min(1, Math.max(0, Math.abs(value) * pulseEffect));
  const intensity = Math.min(255, Math.max(0, Math.floor(adjustedValue * 255)));
  
  if (isInput) {
    if (value < 0) {
      // Negative input: brighter reddish
      const red = 220 + Math.floor(intensity * 0.2);
      const green = 60 + Math.floor(intensity * 0.2);
      const blue = 60;
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Positive input: brighter greenish
      const red = 60;
      const green = 180 + Math.floor(intensity * 0.3);
      const blue = 60 + Math.floor(intensity * 0.2);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  } else {
    // Output nodes: more visible blue to yellow spectrum
    const red = 120 + Math.floor(intensity * 0.7);
    const green = 120 + Math.floor(intensity * 0.7);
    const blue = 220 - Math.floor(intensity * 0.6);
    return `rgb(${red}, ${green}, ${blue})`;
  }
};
