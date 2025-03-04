
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

  useEffect(() => {
    if (!isActive) return;

    // Set up animation loop
    const render = () => {
      renderFrame();
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    render();
    
    // Clean up animation loop on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive, renderFrame, ...dependencies]);
};
