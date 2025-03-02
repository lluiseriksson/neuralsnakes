
import React from 'react';
import { Snake } from '../../types';
import NetworkCanvas from './NetworkCanvas';
import SnakeStats from './SnakeStats';

interface NeuralNetworkVisualizerProps {
  activeSnake: Snake | null;
}

const NeuralNetworkVisualizer: React.FC<NeuralNetworkVisualizerProps> = ({ activeSnake }) => {
  if (!activeSnake) {
    return (
      <div className="border rounded-lg p-4 bg-gray-900 text-white h-[300px] flex items-center justify-center transition-all duration-300 animate-pulse">
        <p className="animate-fade-in">Select a snake to view its neural network</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-2 bg-gray-900 transition-all duration-300 animate-fade-in">
      <NetworkCanvas activeSnake={activeSnake} />
      <SnakeStats activeSnake={activeSnake} />
    </div>
  );
};

export default NeuralNetworkVisualizer;
