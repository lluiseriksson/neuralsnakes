
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

  useEffect(() => {
    if (!isActive) return;

    // Set up animation loop with throttling to prevent excessive renders
    const render = (timestamp: number) => {
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
      
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    animationFrameId.current = requestAnimationFrame(render);
    
    // Clean up animation loop on unmount or when dependencies change
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
    };
  }, [isActive, renderFrame, ...dependencies]);
  
  return frameCountRef.current;
};
