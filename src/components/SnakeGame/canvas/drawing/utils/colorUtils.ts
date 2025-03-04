
/**
 * Helper function to adjust color brightness
 */
export function getAdjustedColor(hex: string, amount: number): string {
  // Handle named colors
  if (hex === 'blue') hex = '#0000FF';
  if (hex === 'green') hex = '#00FF00';
  if (hex === 'yellow') hex = '#FFFF00';
  if (hex === '#9b87f5') hex = '#9b87f5'; // Keep purple as is
  
  // Parse the hex color
  let r = 0, g = 0, b = 0;
  
  // Check if it's a hex color
  if (hex.startsWith('#')) {
    const cleaned = hex.substring(1);
    if (cleaned.length === 3) {
      r = parseInt(cleaned[0] + cleaned[0], 16);
      g = parseInt(cleaned[1] + cleaned[1], 16);
      b = parseInt(cleaned[2] + cleaned[2], 16);
    } else if (cleaned.length === 6) {
      r = parseInt(cleaned.substring(0, 2), 16);
      g = parseInt(cleaned.substring(2, 4), 16);
      b = parseInt(cleaned.substring(4, 6), 16);
    }
  } else {
    // Default to a gray color if parsing fails
    r = g = b = 128;
  }
  
  // Adjust color
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
