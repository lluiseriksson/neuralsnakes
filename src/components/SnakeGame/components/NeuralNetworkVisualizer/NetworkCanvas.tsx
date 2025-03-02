
import React, { useEffect, useRef, useState } from 'react';
import { Snake } from '../../types';
import { drawNetworkNodes } from './drawing/drawNetworkNodes';
import { drawLearningHistory } from './drawing/drawLearningHistory';
import { NodeValues, LearningEvent } from './drawing/types';

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

  // Draw the neural network visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Animation frame for continuous updates
    const animationId = requestAnimationFrame(() => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw network nodes (inputs, outputs, connections)
      drawNetworkNodes(ctx, nodeValues, canvas, activeSnake);
      
      // Draw learning history if available
      if (activeSnake?.debugInfo?.learningEvents && activeSnake.debugInfo.learningEvents.length > 0) {
        const learningEvents = activeSnake.debugInfo.learningEvents as LearningEvent[];
        drawLearningHistory(ctx, learningEvents, canvas);
      }
    });
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [nodeValues, activeSnake]);

  // Add animation class based on snake type
  const getAnimationClass = () => {
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
