
import React from 'react';
import { getCurrentGeneration } from '../hooks/snakeCreation/modelCache';
import { Snake } from '../types';

interface GenerationTrackerProps {
  snakes: Snake[];
}

const GenerationTracker: React.FC<GenerationTrackerProps> = ({ snakes }) => {
  // Get the current generation from our tracking system
  const currentGeneration = getCurrentGeneration();
  
  // Get the highest snake generation and score with proper null checks
  const highestSnakeGeneration = Math.max(...snakes.map(s => 
    typeof s.brain?.getGeneration === 'function' ? s.brain.getGeneration() : 0
  ));
  const highestScore = Math.max(...snakes.map(s => s.score || 0));
  const totalApplesEaten = snakes.reduce((sum, snake) => 
    sum + (snake.decisionMetrics?.applesEaten || 0), 0);
  
  // Calculate survival rate
  const aliveSnakes = snakes.filter(s => s.alive).length;
  const survivalRate = snakes.length > 0 ? (aliveSnakes / snakes.length) * 100 : 0;
  
  // Find the yellow snake (typically ID 0)
  const yellowSnake = snakes.find(s => s.id === 0);
  const yellowSnakeGeneration = typeof yellowSnake?.brain?.getGeneration === 'function' 
    ? yellowSnake.brain.getGeneration() 
    : 0;
  
  // Find the blue snake (typically ID 1)
  const blueSnake = snakes.find(s => s.id === 1);
  const blueSnakeGeneration = typeof blueSnake?.brain?.getGeneration === 'function'
    ? blueSnake.brain.getGeneration()
    : 0;
  
  return (
    <div className="fixed top-4 right-4 bg-black/85 text-white p-3 rounded-md text-sm z-50 max-w-xs shadow-lg border border-gray-700">
      <h3 className="font-bold text-yellow-400 mb-2 text-base">Evolution Information:</h3>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div>Global Generation:</div>
        <div className="font-mono">{currentGeneration}</div>
        
        <div>Yellow Snake Gen:</div>
        <div className="font-mono text-yellow-400">{yellowSnakeGeneration}</div>
        
        <div>Blue Snake Gen:</div>
        <div className="font-mono text-blue-400">{blueSnakeGeneration}</div>
        
        <div>Highest Score:</div>
        <div className="font-mono">{highestScore}</div>
        
        <div>Apples Eaten:</div>
        <div className="font-mono">{totalApplesEaten}</div>
        
        <div>Survival Rate:</div>
        <div className="font-mono">{survivalRate.toFixed(0)}%</div>
      </div>
      
      {/* Simple snake status indicators */}
      <div className="mt-2 space-y-1 border-t border-gray-700 pt-2">
        {snakes.map(snake => (
          <div key={snake.id} className="flex justify-between items-center">
            <div style={{ color: snake.color }}>
              {snake.id === 0 ? "Yellow" : snake.id === 1 ? "Blue" : snake.id === 2 ? "Red" : "Green"} Snake
            </div>
            <div className="flex items-center gap-2">
              <span>Gen: {typeof snake.brain?.getGeneration === 'function' ? snake.brain.getGeneration() : 0}</span>
              <span>Score: {snake.score}</span>
              {!snake.alive && <span className="text-red-500">(Dead)</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerationTracker;
