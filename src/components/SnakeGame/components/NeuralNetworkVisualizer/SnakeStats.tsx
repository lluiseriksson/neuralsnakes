
import React, { useState, useEffect } from 'react';
import { Snake } from '../../types';

interface SnakeStatsProps {
  activeSnake: Snake;
}

const SnakeStats: React.FC<SnakeStatsProps> = ({ activeSnake }) => {
  // Add local state for score to ensure it updates properly
  const [score, setScore] = useState(activeSnake?.score || 0);
  const [applesEaten, setApplesEaten] = useState(activeSnake?.decisionMetrics?.applesEaten || 0);
  
  // Update the local score whenever activeSnake changes
  useEffect(() => {
    if (activeSnake) {
      setScore(activeSnake.score);
      setApplesEaten(activeSnake.decisionMetrics?.applesEaten || 0);
    }
  }, [activeSnake]);
  
  // Calculate success rate with safety check
  const getStats = () => {
    if (typeof activeSnake.brain?.getPerformanceStats === 'function') {
      const stats = activeSnake.brain.getPerformanceStats();
      const totalAttempts = stats.learningAttempts || 1;
      return {
        successRate: (stats.successfulMoves / totalAttempts * 100).toFixed(1),
        generation: typeof activeSnake.brain?.getGeneration === 'function' 
          ? activeSnake.brain.getGeneration() 
          : 0
      };
    }
    return { successRate: "0.0", generation: 0 };
  };
  
  const { successRate, generation } = getStats();
  
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
      case 0: return "Best Model (Yellow)";
      case 1: return "Combined Model (Blue)";
      default: return `Experimental #${activeSnake.id}`;
    }
  };

  return (
    <div className="mt-2 text-xs px-2">
      <p className={`font-semibold ${getSnakeTypeStyle()}`}>
        {getSnakeTypeLabel()} - Score: {score}
      </p>
      <div className="flex justify-between text-xs mt-1">
        <span>Success Rate: {successRate}%</span>
        <span>Generation: {generation}</span>
      </div>
      <div className="mt-1 flex justify-between items-center">
        <div className="w-3/4 bg-gray-800 h-1 rounded-full">
          <div 
            className={`h-1 rounded-full ${activeSnake.id === 0 ? 'bg-yellow-400' : activeSnake.id === 1 ? 'bg-blue-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(parseInt(successRate), 100)}%` }}
          ></div>
        </div>
        <span className="text-xs ml-2">Apples: {applesEaten}</span>
      </div>
    </div>
  );
};

export default SnakeStats;
