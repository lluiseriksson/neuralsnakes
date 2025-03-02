
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
  
  // Calculate kill counts (if available)
  const totalKills = snakes.reduce((sum, snake) => 
    sum + (snake.decisionMetrics?.killCount || 0), 0);
  
  // Calculate survival rate
  const aliveSnakes = snakes.filter(s => s.alive).length;
  const survivalRate = snakes.length > 0 ? (aliveSnakes / snakes.length) * 100 : 0;
  
  // Find the yellow snake (typically ID 0)
  const yellowSnake = snakes.find(s => s.id === 0);
  const yellowSnakeGeneration = yellowSnake?.brain?.getGeneration() || 0;
  
  // Find the blue snake (typically ID 1)
  const blueSnake = snakes.find(s => s.id === 1);
  const blueSnakeGeneration = blueSnake?.brain?.getGeneration() || 0;
  
  return (
    <div className="fixed top-4 right-4 bg-black/85 text-white p-3 rounded-md text-sm z-50 max-w-xs shadow-lg border border-gray-700">
      <h3 className="font-bold text-yellow-400 mb-2 text-base">Información de evolución:</h3>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div>Generación actual:</div>
        <div className="font-mono">{currentGeneration}</div>
        
        <div>Gen. serpiente amarilla:</div>
        <div className="font-mono text-yellow-400">{yellowSnakeGeneration}</div>
        
        <div>Gen. serpiente azul:</div>
        <div className="font-mono text-blue-400">{blueSnakeGeneration}</div>
        
        <div>Mayor generación:</div>
        <div className="font-mono">{highestSnakeGeneration}</div>
        
        <div>Mejor puntuación:</div>
        <div className="font-mono">{highestScore}</div>
        
        <div>Manzanas comidas:</div>
        <div className="font-mono">{totalApplesEaten}</div>
        
        <div>Muertes causadas:</div>
        <div className="font-mono">{totalKills}</div>
        
        <div>Tasa de supervivencia:</div>
        <div className="font-mono">{survivalRate.toFixed(0)}%</div>
      </div>
      
      {/* Detailed decision metrics for advanced users */}
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer hover:text-yellow-400 transition-colors">Métricas detalladas</summary>
        <div className="mt-2 space-y-2">
          {snakes.map(snake => {
            // Calculate effectiveness metrics
            const goodDecisions = snake.decisionMetrics?.goodDirections || 0;
            const badDecisions = snake.decisionMetrics?.badDirections || 0;
            const totalDecisions = goodDecisions + badDecisions;
            const effectiveness = totalDecisions > 0 ? (goodDecisions / totalDecisions) * 100 : 0;
            
            return (
              <div key={snake.id} className="border-t border-gray-700 pt-2">
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
                  
                  <div>Efectividad:</div>
                  <div>{effectiveness.toFixed(1)}%</div>
                  
                  <div>Muertes causadas:</div>
                  <div>{snake.decisionMetrics?.killCount || 0}</div>
                  
                  <div>Suicidios:</div>
                  <div>{snake.decisionMetrics?.suicides || 0}</div>
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
};

export default GenerationTracker;
