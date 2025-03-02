
import React, { useEffect, useRef, useState } from 'react';
import { Snake } from '../../types';
import { drawNetworkNodes } from './drawing/drawNetworkNodes';
import { drawLearningHistory } from './drawing/drawLearningHistory';

interface NetworkCanvasProps {
  activeSnake: Snake;
}

const NetworkCanvas: React.FC<NetworkCanvasProps> = ({ activeSnake }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodeValues, setNodeValues] = useState<{
    inputs: number[],
    outputs: number[],
    inputLabels: string[],
    outputLabels: string[]
  }>({
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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Neural Network Decision Visualization', canvas.width / 2, 20);

    // Draw network nodes (inputs, outputs, connections)
    drawNetworkNodes(ctx, nodeValues, canvas, activeSnake);
    
    // Draw learning history if available
    if (activeSnake?.debugInfo?.learningEvents && activeSnake.debugInfo.learningEvents.length > 0) {
      drawLearningHistory(ctx, activeSnake.debugInfo.learningEvents, canvas);
    }
    
  }, [nodeValues, activeSnake]);

  return (
    <canvas 
      ref={canvasRef} 
      width={550}
      height={300} 
      className="w-full h-full"
    />
  );
};

export default NetworkCanvas;
