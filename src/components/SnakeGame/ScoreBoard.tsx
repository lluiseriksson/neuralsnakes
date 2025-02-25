
import React from 'react';
import { Snake } from './types';

interface ScoreBoardProps {
  snakes: Snake[];
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ snakes }) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      {snakes.map(snake => (
        <div key={snake.id} className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: snake.color }} />
          <span className="font-medium text-white">
            Score: {snake.score} {!snake.alive && '(Dead)'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ScoreBoard;
