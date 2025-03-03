
import React from 'react';
import { Snake } from '../../types';

interface SnakeStatsProps {
  activeSnake: Snake;
}

const SnakeStats: React.FC<SnakeStatsProps> = ({ activeSnake }) => {
  // Calculate success rate with safety check
  const totalAttempts = activeSnake.brain.getPerformanceStats().learningAttempts || 1;
  const successRate = (activeSnake.brain.getPerformanceStats().successfulMoves / totalAttempts * 100).toFixed(1);
  
  // Special styling for different snake types
  const getSnakeTypeStyle = () => {
    switch (activeSnake.id) {
      case 0: return "text-yellow-400"; // Yellow snake
      case 1: return "text-blue-400";   // Blue snake
      default: return "text-gray-300";  // Other snakes
    }
  };
  
  // Get snake type label
  const getSnakeTypeLabel = () => {
    switch (activeSnake.id) {
      case 0: return "Modelo Óptimo (Amarillo)";
      case 1: return "Modelo Combinado (Azul)";
      default: return `Experimental #${activeSnake.id}`;
    }
  };

  return (
    <div className="mt-2 text-xs px-2">
      <p className={`font-semibold ${getSnakeTypeStyle()}`}>
        {getSnakeTypeLabel()} - Puntuación: {activeSnake.score}
      </p>
      <div className="flex justify-between text-xs mt-1">
        <span>Tasa de éxito: {successRate}%</span>
        <span>Generación: {activeSnake.brain.getGeneration()}</span>
      </div>
      <div className="mt-1 flex justify-between items-center">
        <div className="w-3/4 bg-gray-800 h-1 rounded-full">
          <div 
            className={`h-1 rounded-full ${activeSnake.id === 0 ? 'bg-yellow-400' : activeSnake.id === 1 ? 'bg-blue-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(parseInt(successRate), 100)}%` }}
          ></div>
        </div>
        <span className="text-xs ml-2">Manzanas: {activeSnake.decisionMetrics?.applesEaten || 0}</span>
      </div>
    </div>
  );
};

export default SnakeStats;
