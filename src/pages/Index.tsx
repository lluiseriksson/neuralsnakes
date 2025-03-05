
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
      
      <div className="flex flex-col gap-8 items-center mt-4 w-full max-w-[1400px]">
        <div className="w-full">
          <GameVisualizer 
            gameState={gameState}
            startTime={startTime}
            isRecording={false}
            onSelectSnake={handleSelectSnake}
          />
        </div>
        
        <div className="w-full flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-1/2">
            <ScoreBoard 
              snakes={gameState.snakes || []} 
              generationInfo={generationInfo}
            />
          </div>
          
          <div className="w-full lg:w-1/2">
            <SnakeVisualizer
              snakes={gameState.snakes || []}
              activeSnake={activeSnake}
              onSelectSnake={handleSelectSnake}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
