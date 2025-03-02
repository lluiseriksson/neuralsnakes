
import React from 'react';
import { Snake } from '../../types';

interface SnakeStatsProps {
  activeSnake: Snake;
}

const SnakeStats: React.FC<SnakeStatsProps> = ({ activeSnake }) => {
  return (
    <div className="mt-2 text-xs text-gray-300 px-2">
      <p>Snake #{activeSnake.id} - Score: {activeSnake.score}</p>
      <div className="flex justify-between text-xs mt-1">
        <span>Success rate: {(activeSnake.brain.getPerformanceStats().successfulMoves / (activeSnake.brain.getPerformanceStats().learningAttempts || 1) * 100).toFixed(1)}%</span>
        <span>Gen: {activeSnake.brain.getGeneration()}</span>
      </div>
    </div>
  );
};

export default SnakeStats;
