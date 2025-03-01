
import React from 'react';
import { Snake } from './types';

interface ScoreBoardProps {
  snakes: Snake[];
  generationInfo?: {
    generation: number;
    bestScore: number;
    progress: number;
  };
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ snakes, generationInfo }) => {
  return (
    <div className="mt-4 space-y-4">
      {generationInfo && (
        <div className="bg-gray-800 p-3 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Estadísticas de Evolución</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-gray-400 text-sm">Generación:</span>
              <p className="font-medium">{generationInfo.generation}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Mejor Puntaje:</span>
              <p className="font-medium">{generationInfo.bestScore}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Progreso:</span>
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${generationInfo.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1">{Math.round(generationInfo.progress)}%</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {snakes.map(snake => (
          <div key={snake.id} className="bg-gray-900 p-3 rounded-lg flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full flex-shrink-0`} style={{ backgroundColor: snake.color }} />
            <div className="flex-1">
              <span className="font-medium text-white">
                Score: {snake.score} 
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Gen: {snake.brain.getGeneration()}</span>
                {!snake.alive && <span className="text-xs text-red-400">(Dead)</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;
