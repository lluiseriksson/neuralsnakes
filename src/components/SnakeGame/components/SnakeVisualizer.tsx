
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
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
      <h3 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-2">Visualización de Decisiones</h3>
      <SnakeSelector 
        snakes={snakes} 
        onSelectSnake={onSelectSnake} 
        activeSnakeId={activeSnake?.id || null} 
      />
      <NeuralNetworkVisualizer activeSnake={activeSnake} />
    </div>
  );
};

export default SnakeVisualizer;
