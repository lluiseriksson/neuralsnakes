
// Calculate node color based on its activation value with enhanced pulsing effect
export const getNodeColor = (value: number, isInput: boolean): string => {
  // Enhanced pulsing effect based on time for more visible animation
  const time = Date.now();
  const pulseEffect = (Math.sin(time / 300) * 0.25) + 0.9;
  const adjustedValue = Math.min(1, Math.max(0, Math.abs(value) * pulseEffect));
  const intensity = Math.min(255, Math.max(0, Math.floor(adjustedValue * 255)));
  
  if (isInput) {
    if (value < 0) {
      // Negative input: brighter reddish with pulsing
      const red = 230 + Math.floor((Math.sin(time / 250) * 25));
      const green = 60 + Math.floor(intensity * 0.2);
      const blue = 60 + Math.floor((Math.sin(time / 300) * 15));
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Positive input: brighter greenish with pulsing
      const red = 60 + Math.floor((Math.sin(time / 350) * 15));
      const green = 200 + Math.floor((Math.sin(time / 300) * 25));
      const blue = 60 + Math.floor(intensity * 0.2);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  } else {
    // Output nodes: more visible blue to yellow spectrum with enhanced pulsing
    const pulseIntensity = Math.sin(time / 250) * 20;
    const red = 130 + Math.floor(intensity * 0.7) + pulseIntensity;
    const green = 130 + Math.floor(intensity * 0.7) + pulseIntensity;
    const blue = 230 - Math.floor(intensity * 0.6) + (Math.sin(time / 400) * 15);
    return `rgb(${red}, ${green}, ${blue})`;
  }
};
