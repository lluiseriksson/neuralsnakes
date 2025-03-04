
import { useEffect } from 'react';

/**
 * Custom hook to handle canvas setup with pixel ratio considerations
 */
export const useCanvasSetup = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number
) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions with pixel ratio for sharper rendering
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Get context and scale for retina displays
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
    }
    
    console.log(`Canvas initialized: ${canvas.width}x${canvas.height} (${pixelRatio}x)`);
  }, [width, height]);
};
