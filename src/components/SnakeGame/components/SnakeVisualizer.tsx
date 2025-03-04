
import React from 'react';
import SnakeSelector from "./SnakeSelector";
import NeuralNetworkVisualizer from "./NeuralNetworkVisualizer";
import { Snake } from "../types";

interface SnakeVisualizerProps {
  snakes: Snake[];
  activeSnake: Snake | null;
  onSelectSnake: (snake: Snake) => void;
}

const SnakeVisualizer: React.FC<SnakeVisualizerProps> = ({
  snakes,
  activeSnake,
  onSelectSnake
}) => {
  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white w-full">
      <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Decision Visualization</h3>
      <div className="min-h-[280px]">
        <SnakeSelector 
          snakes={snakes} 
          onSelectSnake={onSelectSnake} 
          activeSnakeId={activeSnake?.id || null} 
        />
        <NeuralNetworkVisualizer activeSnake={activeSnake} />
      </div>
    </div>
  );
};

export default SnakeVisualizer;
