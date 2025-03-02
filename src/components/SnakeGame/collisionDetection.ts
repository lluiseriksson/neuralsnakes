
// Export the main collision detection function and utilities with additional information
import { checkCollisions } from './collisionDetection/checkCollisions';

// Re-export with additional context
export { checkCollisions };

// Create a helper function that can provide detailed collision information for visualization
export const getCollisionInfo = (snakeId: number, headPosition: { x: number, y: number }, apples: any[]) => {
  // Check if snake head is near an apple (for visualization purposes)
  const nearbyApples = apples.filter(apple => {
    const distance = Math.abs(headPosition.x - apple.position.x) + Math.abs(headPosition.y - apple.position.y);
    return distance <= 3; // Consider apples within 3 cells as "nearby"
  });
  
  return {
    hasNearbyApples: nearbyApples.length > 0,
    nearbyApples,
    closestAppleDistance: nearbyApples.length > 0 
      ? Math.min(...nearbyApples.map(apple => 
          Math.abs(headPosition.x - apple.position.x) + Math.abs(headPosition.y - apple.position.y)
        ))
      : null
  };
};
