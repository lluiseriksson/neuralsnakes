
import React from 'react';
import { Snake } from '../types';

interface SnakeSelectorProps {
  snakes: Snake[];
  onSelectSnake: (snake: Snake) => void;
  activeSnakeId: number | null;
}

const SnakeSelector: React.FC<SnakeSelectorProps> = ({ snakes, onSelectSnake, activeSnakeId }) => {
  // Ensure we always have a valid array of snakes
  const validSnakes = Array.isArray(snakes) ? snakes : [];
  
  // Get snake name based on ID
  const getSnakeName = (id: number) => {
    switch (id) {
      case 0: return "Yellow Snake";
      case 1: return "Blue Snake";
      case 2: return "Green Snake";
      case 3: return "Purple Snake";
      default: return `Snake #${id}`;
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {validSnakes.map(snake => (
        <button
          key={snake.id}
          onClick={() => onSelectSnake(snake)}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors flex-grow md:flex-grow-0 ${
            activeSnakeId === snake.id
              ? 'bg-blue-600 text-white'
              : snake.alive 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          style={{ borderLeft: `4px solid ${snake.color}` }}
        >
          {getSnakeName(snake.id)} - {snake.alive ? 'Alive' : 'Dead'} - Score: {snake.score}
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
