
import React from 'react';
import { Snake } from '../types';

interface SnakeSelectorProps {
  snakes: Snake[];
  onSelectSnake: (snake: Snake) => void;
  activeSnakeId: number | null;
}

const SnakeSelector: React.FC<SnakeSelectorProps> = ({ snakes, onSelectSnake, activeSnakeId }) => {
  // Asegurarnos de que siempre hay un array válido de serpientes
  const validSnakes = Array.isArray(snakes) ? snakes : [];
  
  // Mostrar todas las serpientes, no solo las vivas para diagnóstico
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {validSnakes.map(snake => (
        <button
          key={snake.id}
          onClick={() => onSelectSnake(snake)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            activeSnakeId === snake.id
              ? 'bg-blue-600 text-white'
              : snake.alive 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          style={{ borderLeft: `4px solid ${snake.color}` }}
        >
          Snake #{snake.id} - {snake.alive ? 'Alive' : 'Dead'} - Score: {snake.score}
        </button>
      ))}
      {validSnakes.length === 0 && (
        <div className="text-gray-400 text-sm px-2">
          No snakes available - Game may be initializing
        </div>
      )}
    </div>
  );
};

export default SnakeSelector;
