
import React from 'react';
import { getCurrentGeneration } from '../hooks/snakeCreation/modelCache';
import { Snake } from '../types';

interface GenerationTrackerProps {
  snakes: Snake[];
}

const GenerationTracker: React.FC<GenerationTrackerProps> = ({ snakes }) => {
  // Get the current generation from our tracking system
  const currentGeneration = getCurrentGeneration();
  
  // Get the highest snake generation and score
  const highestSnakeGeneration = Math.max(...snakes.map(s => s.brain?.getGeneration() || 0));
  const highestScore = Math.max(...snakes.map(s => s.score || 0));
  const totalApplesEaten = snakes.reduce((sum, snake) => 
    sum + (snake.decisionMetrics?.applesEaten || 0), 0);
  
  // Find the yellow snake (typically ID 0)
  const yellowSnake = snakes.find(s => s.id === 0);
  const yellowSnakeGeneration = yellowSnake?.brain?.getGeneration() || 0;
  
  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-2 rounded-md text-sm z-50 max-w-xs shadow-lg">
      <h3 className="font-bold text-yellow-400 mb-1">Información de evolución:</h3>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <div>Generación actual:</div>
        <div className="font-mono">{currentGeneration}</div>
        
        <div>Gen. serpiente amarilla:</div>
        <div className="font-mono text-yellow-400">{yellowSnakeGeneration}</div>
        
        <div>Mayor generación:</div>
        <div className="font-mono">{highestSnakeGeneration}</div>
        
        <div>Mejor puntuación:</div>
        <div className="font-mono">{highestScore}</div>
        
        <div>Manzanas comidas:</div>
        <div className="font-mono">{totalApplesEaten}</div>
      </div>
      
      {/* Detailed decision metrics for advanced users */}
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer">Métricas detalladas</summary>
        <div className="mt-1 space-y-1">
          {snakes.map(snake => (
            <div key={snake.id} className="border-t border-gray-700 pt-1">
              <div className="font-semibold" style={{ color: snake.color }}>
                Serpiente {snake.id} (Gen: {snake.brain?.getGeneration() || 0})
              </div>
              <div className="grid grid-cols-2 gap-x-1">
                <div>Manzanas comidas:</div>
                <div>{snake.decisionMetrics?.applesEaten || 0}</div>
                
                <div>Manzanas ignoradas:</div>
                <div>{snake.decisionMetrics?.applesIgnored || 0}</div>
                
                <div>Buenas decisiones:</div>
                <div>{snake.decisionMetrics?.goodDirections || 0}</div>
                
                <div>Malas decisiones:</div>
                <div>{snake.decisionMetrics?.badDirections || 0}</div>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default GenerationTracker;
