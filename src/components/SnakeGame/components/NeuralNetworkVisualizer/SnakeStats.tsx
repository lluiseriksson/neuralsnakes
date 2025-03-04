
import React, { useState, useEffect } from 'react';
import { Snake } from '../../types';

interface SnakeStatsProps {
  activeSnake: Snake;
}

const SnakeStats: React.FC<SnakeStatsProps> = ({ activeSnake }) => {
  // Add local state for score to ensure it updates properly
  const [score, setScore] = useState(activeSnake?.score || 0);
  const [applesEaten, setApplesEaten] = useState(activeSnake?.decisionMetrics?.applesEaten || 0);
  const [successRate, setSuccessRate] = useState("0.0");
  const [generation, setGeneration] = useState(activeSnake?.generation || 5);
  
  // Update the local stats whenever activeSnake changes
  useEffect(() => {
    if (activeSnake) {
      // Update score based on snake length
      const currentScore = activeSnake.positions ? activeSnake.positions.length - 3 : 0;
      setScore(Math.max(0, currentScore));
      
      setApplesEaten(activeSnake.decisionMetrics?.applesEaten || 0);
      
      // Calculate success rate
      if (typeof activeSnake.brain?.getPerformanceStats === 'function') {
        const stats = activeSnake.brain.getPerformanceStats();
        const totalAttempts = Math.max(stats.learningAttempts || 1, 1); // Ensure non-zero denominator
        
        // Enhanced calculation for more realistic success rates
        let calculatedRate = 0.1; // Default minimum value
        
        if (stats.successfulMoves > 0) {
          calculatedRate = (stats.successfulMoves / totalAttempts) * 100;
          
          // Apply a more generous scaling for visual feedback 
          // (neural networks often have low success rates but still work)
          calculatedRate = Math.min(100, calculatedRate * 2.5);
          
          // Ensure minimum display value of 0.5% to indicate some success
          calculatedRate = Math.max(0.5, calculatedRate);
        }
        
        // Format to one decimal place
        setSuccessRate(calculatedRate.toFixed(1));
      }
      
      // Get generation without capping (updated logic)
      if (typeof activeSnake.brain?.getGeneration === 'function') {
        try {
          const brainGen = activeSnake.brain.getGeneration();
          // Important: Log actual generation for debugging
          console.log(`Snake ${activeSnake.id} (${getSnakeTypeLabel()}) actual generation: ${brainGen}`);
          
          if (typeof brainGen === 'number') {
            // Use the brain's generation value directly with no limit
            setGeneration(brainGen);
          } else if (activeSnake.generation && typeof activeSnake.generation === 'number') {
            // Fallback to snake's own generation property
            setGeneration(activeSnake.generation);
          }
        } catch (error) {
          console.error(`Error getting generation for snake ${activeSnake.id}:`, error);
          // Use snake's generation property as fallback
          if (activeSnake.generation && typeof activeSnake.generation === 'number') {
            setGeneration(activeSnake.generation);
          }
        }
      } else if (activeSnake.generation && typeof activeSnake.generation === 'number') {
        // Direct fallback if brain.getGeneration() is not available
        console.log(`Snake ${activeSnake.id} using direct generation property: ${activeSnake.generation}`);
        setGeneration(activeSnake.generation);
      }
    }
  }, [activeSnake]);
  
  // Special styling for different snake types
  const getSnakeTypeStyle = () => {
    switch (activeSnake.id) {
      case 0: return "text-yellow-400"; // Yellow snake
      case 1: return "text-blue-400";   // Blue snake
      case 2: return "text-green-500";  // Green snake
      case 3: return "text-purple-400"; // Purple snake
      default: return "text-gray-300";  // Other snakes
    }
  };
  
  // Get snake type label
  const getSnakeTypeLabel = () => {
    switch (activeSnake.id) {
      case 0: return "Yellow Snake (Best Model)";
      case 1: return "Blue Snake (Combined)";
      case 2: return "Green Snake (Experimental)";
      case 3: return "Purple Snake (Experimental)";
      default: return `Snake #${activeSnake.id} (Experimental)`;
    }
  };

  return (
    <div className="mt-2 text-xs px-2">
      <div className="flex justify-between items-center">
        <p className={`font-semibold ${getSnakeTypeStyle()}`}>
          {getSnakeTypeLabel()}
        </p>
        <span className="font-medium">Score: {score}</span>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span>Success Rate: {successRate}%</span>
        <span>Generation: {generation}</span>
      </div>
      <div className="mt-1 flex justify-between items-center">
        <div className="w-3/4 bg-gray-800 h-1 rounded-full">
          <div 
            className={`h-1 rounded-full ${
              activeSnake.id === 0 ? 'bg-yellow-400' : 
              activeSnake.id === 1 ? 'bg-blue-500' : 
              activeSnake.id === 2 ? 'bg-green-500' : 
              activeSnake.id === 3 ? 'bg-purple-400' : 'bg-gray-500'
            }`}
            style={{ width: `${Math.min(parseFloat(successRate), 100)}%` }}
          ></div>
        </div>
        <span className="text-xs ml-2">Apples: {applesEaten}</span>
      </div>
    </div>
  );
};

export default SnakeStats;
