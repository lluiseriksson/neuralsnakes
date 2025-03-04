
import React, { useEffect, useRef, useState } from 'react';
import { Snake } from '../../types';
import { drawNetworkNodes } from './drawing/drawNetworkNodes';
import { NodeValues } from './drawing/types';

interface NetworkCanvasProps {
  activeSnake: Snake;
}

const NetworkCanvas: React.FC<NetworkCanvasProps> = ({ activeSnake }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodeValues, setNodeValues] = useState<NodeValues>({
    inputs: [],
    outputs: [],
    inputLabels: ['Up Apple', 'Right Apple', 'Down Apple', 'Left Apple', 'Up Obstacle', 'Right Obstacle', 'Down Obstacle', 'Left Obstacle'],
    outputLabels: ['UP', 'RIGHT', 'DOWN', 'LEFT']
  });

  // Update node values when the active snake changes
  useEffect(() => {
    if (activeSnake && activeSnake.lastInputs && activeSnake.lastOutputs) {
      setNodeValues({
        ...nodeValues,
        inputs: activeSnake.lastInputs,
        outputs: activeSnake.lastOutputs
      });
    }
  }, [activeSnake]);

  // Draw the neural network visualization with animation frame for smoother updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeSnake) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use requestAnimationFrame for smoother rendering
    let animationFrameId: number;

    const renderFrame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw network nodes (inputs, outputs, connections)
      drawNetworkNodes(ctx, nodeValues, canvas, activeSnake);
      
      // Get generation info for display - handle null brain
      ctx.fillStyle = '#AAAAAA';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      
      const generation = typeof activeSnake.brain?.getGeneration === 'function' 
        ? activeSnake.brain.getGeneration() 
        : 5;
        
      ctx.fillText(`Generation: ${generation}`, canvas.width - 10, 20);
      
      // Continue animation loop
      animationFrameId = requestAnimationFrame(renderFrame);
    };
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(renderFrame);
    
    return () => {
      // Clean up animation on unmount
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodeValues, activeSnake]);

  // Add animation class based on snake type
  const getAnimationClass = () => {
    if (!activeSnake) return "border-gray-600";
    
    switch(activeSnake.id) {
      case 0: return "border-yellow-400";  // Yellow snake
      case 1: return "border-blue-400";    // Blue snake
      default: return "border-gray-600";
    }
  };

  return (
    <canvas 
      ref={canvasRef} 
      width={550}
      height={300}
      className={`w-full h-full transition-all duration-300 animate-fade-in border border-opacity-30 rounded ${getAnimationClass()}`}
    />
  );
};

export default NetworkCanvas;
