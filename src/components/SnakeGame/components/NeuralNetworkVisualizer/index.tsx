
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
      <div className="border rounded-lg p-4 bg-gray-900 text-white h-[350px] flex items-center justify-center transition-all duration-300 animate-pulse">
        <div className="text-center">
          <p className="animate-fade-in mb-2">Select a snake to view its neural network</p>
          <div className="flex justify-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          </div>
        </div>
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
