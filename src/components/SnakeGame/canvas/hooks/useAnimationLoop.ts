
import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage the animation loop
 */
export const useAnimationLoop = (
  isActive: boolean,
  renderFrame: () => void,
  dependencies: any[] = []
) => {
  const animationFrameId = useRef<number>();
  const isRenderingRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const gameEndedRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;
    
    // Reset game ended flag when animation becomes active
    gameEndedRef.current = false;

    // Handler for timer end event to stop animation
    const handleTimerEnd = () => {
      console.log("Timer end detected in animation loop");
      gameEndedRef.current = true;
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
    };
    
    window.addEventListener('timer-end', handleTimerEnd);

    // Set up animation loop with throttling to prevent excessive renders
    const render = (timestamp: number) => {
      // Stop rendering if game has ended
      if (gameEndedRef.current) {
        return;
      }
      
      // Skip if already rendering to prevent recursive renders
      if (isRenderingRef.current) {
        animationFrameId.current = requestAnimationFrame(render);
        return;
      }
      
      // Throttle to a reasonable frame rate
      const timeSinceLastRender = timestamp - lastRenderTimeRef.current;
      const shouldRender = timeSinceLastRender > 16; // Target ~60fps
      
      if (shouldRender) {
        try {
          isRenderingRef.current = true;
          renderFrame();
          frameCountRef.current += 1;
          lastRenderTimeRef.current = timestamp;
        } finally {
          isRenderingRef.current = false;
        }
      }
      
      if (!gameEndedRef.current) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };
    
    animationFrameId.current = requestAnimationFrame(render);
    
    // Clean up animation loop on unmount or when dependencies change
    return () => {
      window.removeEventListener('timer-end', handleTimerEnd);
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
    };
  }, [isActive, renderFrame, ...dependencies]);
  
  return frameCountRef.current;
};
