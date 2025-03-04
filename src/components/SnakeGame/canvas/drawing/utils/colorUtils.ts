
/**
 * Helper function to adjust color brightness with improved accuracy
 */
export function getAdjustedColor(hex: string, amount: number): string {
  // Handle named colors
  if (hex === 'blue') hex = '#0080FF';
  if (hex === 'green') hex = '#00D000';
  if (hex === 'yellow') hex = '#FFDD00';
  if (hex === 'red') hex = '#FF3030';
  if (hex === 'purple' || hex === '#9b87f5') hex = '#9b87f5';
  
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
    // Default to a bright color if parsing fails
    r = 200; g = 200; b = 200;
  }
  
  // Adjust color with improved algorithm for better contrast
  if (amount > 0) {
    // Brightening: emphasize the dominant color channel
    const max = Math.max(r, g, b);
    if (max === r) {
      r = Math.min(255, r + amount * 1.2);
      g = Math.min(255, g + amount * 0.8);
      b = Math.min(255, b + amount * 0.8);
    } else if (max === g) {
      r = Math.min(255, r + amount * 0.8);
      g = Math.min(255, g + amount * 1.2);
      b = Math.min(255, b + amount * 0.8);
    } else {
      r = Math.min(255, r + amount * 0.8);
      g = Math.min(255, g + amount * 0.8);
      b = Math.min(255, b + amount * 1.2);
    }
  } else {
    // Darkening: maintain color character
    r = Math.max(0, r + amount);
    g = Math.max(0, g + amount);
    b = Math.max(0, b + amount);
  }
  
  // Convert back to hex with proper padding
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}
