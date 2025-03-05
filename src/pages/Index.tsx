
import React, { useCallback, useEffect, useState } from "react";
import { useGameLogic } from "../components/SnakeGame/hooks/useGameLogic";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";
import VictoryDisplay from "../components/SnakeGame/components/VictoryDisplay";
import { useToast } from "../components/ui/use-toast";
import { Snake } from "../components/SnakeGame/types";
import GameVisualizer from "../components/SnakeGame/components/GameVisualizer";
import SnakeVisualizer from "../components/SnakeGame/components/SnakeVisualizer";

const Index = () => {
  const [activeSnake, setActiveSnake] = useState<Snake | null>(null);
  const { 
    gameState, 
    victories, 
    startTime, 
    generationInfo, 
    isGameRunning
  } = useGameLogic();
  const { toast } = useToast();
  
  useEffect(() => {
    if (activeSnake && !gameState.snakes.some(s => s.id === activeSnake.id && s.alive)) {
      setActiveSnake(null);
    }
    
    if (!activeSnake && gameState.snakes && gameState.snakes.length > 0) {
      const livingSnakes = gameState.snakes.filter(snake => snake.alive);
      if (livingSnakes.length > 0) {
        setActiveSnake(livingSnakes[0]);
      }
    }
    
    if (activeSnake) {
      const updatedSnake = gameState.snakes.find(s => s.id === activeSnake.id);
      if (updatedSnake && updatedSnake.alive) {
        setActiveSnake(updatedSnake);
      }
    }
  }, [gameState.snakes, activeSnake]);
  
  const handleSelectSnake = (snake: Snake) => {
    setActiveSnake(snake);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4">
      <h1 className="text-4xl font-bold mb-6 text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Neural Snakes
      </h1>
      
      <div className="flex items-center justify-center w-full max-w-[1400px] mb-4">
        <VictoryDisplay victories={victories} />
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start mt-4 w-full max-w-[1400px]">
        <div className="w-full lg:w-[60%]">
          <GameVisualizer 
            gameState={gameState}
            startTime={startTime}
            isRecording={false}
            onSelectSnake={handleSelectSnake}
          />
        </div>
        
        <div className="w-full lg:w-[40%] flex flex-col gap-5">
          <SnakeVisualizer
            snakes={gameState.snakes || []}
            activeSnake={activeSnake}
            onSelectSnake={handleSelectSnake}
          />
          
          {generationInfo && (
            <div className="bg-gray-800 p-3 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">Current Generation: {generationInfo.generation}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 text-sm">Best Score:</span>
                  <p className="font-medium">{Math.max(0, Math.floor(generationInfo.bestScore || 0))}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Progress:</span>
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
        </div>
      </div>
    </div>
  );
};

export default Index;
