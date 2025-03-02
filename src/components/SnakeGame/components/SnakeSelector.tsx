
import React from 'react';
import { Snake } from '../types';

interface SnakeSelectorProps {
  snakes: Snake[];
  onSelectSnake: (snake: Snake) => void;
  activeSnakeId: number | null;
}

const SnakeSelector: React.FC<SnakeSelectorProps> = ({ snakes, onSelectSnake, activeSnakeId }) => {
  const livingSnakes = snakes.filter(snake => snake.alive);
  
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {livingSnakes.map(snake => (
        <button
          key={snake.id}
          onClick={() => onSelectSnake(snake)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            activeSnakeId === snake.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
          style={{ borderLeft: `4px solid ${snake.color}` }}
        >
          Snake #{snake.id} - Score: {snake.score}
        </button>
      ))}
      {livingSnakes.length === 0 && (
        <div className="text-gray-400 text-sm px-2">
          No living snakes to select
        </div>
      )}
    </div>
  );
};

export default SnakeSelector;
