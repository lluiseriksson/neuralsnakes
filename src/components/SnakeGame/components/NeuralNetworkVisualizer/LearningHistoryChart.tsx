
import React from 'react';
import { Snake } from '../../types';
import { LearningEvent } from './drawing/types';

interface LearningHistoryChartProps {
  activeSnake: Snake;
}

const LearningHistoryChart: React.FC<LearningHistoryChartProps> = ({ activeSnake }) => {
  // Get learning events from the snake
  const learningEvents = activeSnake?.debugInfo?.learningEvents as LearningEvent[] || [];
  
  // Only show the last 20 events
  const events = learningEvents.slice(-20);
  
  // If no events, show placeholder
  if (events.length === 0) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg text-gray-400 text-center text-sm">
        No learning history available yet
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-3 rounded-lg">
      <h3 className="text-sm font-medium text-gray-300 mb-1">Learning History</h3>
      <div className="h-20 relative bg-gray-900 rounded-md overflow-hidden">
        {/* Zero line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-700"></div>
        
        {/* Event bars */}
        <div className="flex h-full items-center">
          {events.map((event, index) => {
            // Calculate bar height and color based on reward
            const reward = event.reward || 0;
            const barHeight = Math.min(80, Math.abs(reward) * 80);
            const isPositive = reward > 0;
            
            // Green for positive, red for negative
            const barColor = isPositive 
              ? `rgb(${100 - Math.floor(Math.abs(reward) * 200)/3}, ${150 + Math.floor(Math.abs(reward) * 200)/3}, ${100 - Math.floor(Math.abs(reward) * 200)/3})`
              : `rgb(${150 + Math.floor(Math.abs(reward) * 200)/3}, ${100 - Math.floor(Math.abs(reward) * 200)/3}, ${100 - Math.floor(Math.abs(reward) * 200)/3})`;
            
            return (
              <div 
                key={index} 
                className="flex-1 h-full flex items-center justify-center"
              >
                <div 
                  style={{ 
                    height: `${barHeight}%`,
                    backgroundColor: barColor,
                    bottom: isPositive ? '50%' : 'auto',
                    top: isPositive ? 'auto' : '50%',
                  }}
                  className={`w-3/4 absolute ${isPositive ? 'rounded-t' : 'rounded-b'}`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 mr-1 rounded-full"></div>
          <span>Good decisions</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 mr-1 rounded-full"></div>
          <span>Bad decisions</span>
        </div>
      </div>
    </div>
  );
};

export default LearningHistoryChart;
