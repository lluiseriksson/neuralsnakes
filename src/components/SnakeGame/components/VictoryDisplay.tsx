
import React from 'react';

interface VictoryDisplayProps {
  victories: { [key: number]: number };
}

const VictoryDisplay: React.FC<VictoryDisplayProps> = ({ victories }) => {
  // Get snake color name based on ID
  const getSnakeColorName = (id: number) => {
    switch (id) {
      case 0: return "Yellow";
      case 1: return "Blue";
      case 2: return "Green";
      case 3: return "Purple";
      default: return `#${id}`;
    }
  };

  return (
    <div className="mb-4 grid grid-cols-2 gap-4">
      {Object.entries(victories).map(([id, wins]) => (
        <div key={id} className="text-white flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: ['yellow', 'blue', 'green', '#9b87f5'][Number(id)] }} 
          />
          <span>{getSnakeColorName(Number(id))} Snake Victories: {wins}</span>
        </div>
      ))}
    </div>
  );
};

export default VictoryDisplay;
