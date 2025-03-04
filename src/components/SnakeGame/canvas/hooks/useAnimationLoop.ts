
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

  useEffect(() => {
    if (!isActive) return;

    // Set up animation loop
    const render = () => {
      if (!isRenderingRef.current) {
        try {
          isRenderingRef.current = true;
          renderFrame();
          frameCountRef.current += 1;
        } finally {
          isRenderingRef.current = false;
        }
      }
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    render();
    
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
