
import React from 'react';
import { Snake } from '../types';
import { LearningEvent } from './NeuralNetworkVisualizer/drawing/types';

interface LearningHistoryProps {
  activeSnake: Snake | null;
}

const LearningHistory: React.FC<LearningHistoryProps> = ({ activeSnake }) => {
  if (!activeSnake || !activeSnake.debugInfo?.learningEvents) {
    return (
      <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
        <h3 className="text-lg font-semibold mb-2">Learning History</h3>
        <div className="text-center text-gray-400 py-2">
          Select a snake to view its learning history
        </div>
      </div>
    );
  }

  const learningEvents = activeSnake.debugInfo.learningEvents as LearningEvent[] || [];
  const events = learningEvents.slice(-20); // Only show last 20 events
  
  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
      <h3 className="text-lg font-semibold mb-2">Learning History - Snake #{activeSnake.id}</h3>
      
      <div className="h-24 bg-gray-800 rounded-lg relative overflow-hidden">
        {/* Zero line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-600"></div>
        
        {/* Event bars */}
        <div className="flex h-full items-center px-2">
          {events.length === 0 ? (
            <div className="w-full text-center text-gray-400 text-sm">No learning data available</div>
          ) : (
            events.map((event, index) => {
              const reward = event.reward || 0;
              const barHeight = Math.min(90, Math.abs(reward) * 90);
              const isPositive = reward > 0;
              
              // Green for positive, red for negative
              const barColor = isPositive 
                ? `rgb(${100 - Math.floor(Math.abs(reward) * 200)/3}, ${150 + Math.floor(Math.abs(reward) * 200)/3}, ${100 - Math.floor(Math.abs(reward) * 200)/3})`
                : `rgb(${150 + Math.floor(Math.abs(reward) * 200)/3}, ${100 - Math.floor(Math.abs(reward) * 200)/3}, ${100 - Math.floor(Math.abs(reward) * 200)/3})`;
              
              return (
                <div key={index} className="flex-1 h-full flex items-center justify-center relative">
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
            })
          )}
        </div>
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-300">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 mr-1 rounded-full"></div>
          <span>Positive rewards (good decisions)</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 mr-1 rounded-full"></div>
          <span>Negative rewards (bad decisions)</span>
        </div>
      </div>
    </div>
  );
};

export default LearningHistory;
