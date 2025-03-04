
import React, { useCallback, useEffect, useState } from "react";
import { useGameLogic } from "../components/SnakeGame/hooks/useGameLogic";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";
import VictoryDisplay from "../components/SnakeGame/components/VictoryDisplay";
import { useToast } from "../components/ui/use-toast";
import { Snake } from "../components/SnakeGame/types";
import GameVisualizer from "../components/SnakeGame/components/GameVisualizer";
import SnakeVisualizer from "../components/SnakeGame/components/SnakeVisualizer";
import GenerationInfo from "../components/SnakeGame/components/GenerationInfo";
import GameControls from "../components/SnakeGame/components/GameControls";
import LearningHistory from "../components/SnakeGame/components/LearningHistory";

const Index = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeSnake, setActiveSnake] = useState<Snake | null>(null);
  const { 
    gameState, 
    victories, 
    startTime, 
    generationInfo, 
    initializeGame, 
    isGameRunning
  } = useGameLogic();
  const { toast } = useToast();
  
  const handleInitializeGame = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    console.log("Solicitando inicialización del juego desde Index...");
    
    try {
      toast({
        title: "Starting New Evolution",
        description: "Creating neural networks and preparing the simulation..."
      });
      
      await initializeGame();
      console.log("Inicialización completada desde Index");
      
      toast({
        title: "Evolution Started!",
        description: `${gameState.snakes?.length || 0} neural networks are learning (Generation ${generationInfo.generation})`
      });
    } catch (error) {
      console.error("Error en la inicialización desde Index:", error);
      toast({
        title: "Initialization Error",
        description: "There was a problem starting the simulation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  }, [initializeGame, isInitializing, gameState.snakes, toast, generationInfo]);
  
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
  
  useEffect(() => {
    console.log("Componente Index montado");
    
    const timer = setTimeout(() => {
      console.log("Iniciando juego automáticamente después de time out");
      handleInitializeGame();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [handleInitializeGame]);
  
  const handleSelectSnake = (snake: Snake) => {
    setActiveSnake(snake);
  };
  
  useEffect(() => {
    const currentGenElement = document.getElementById('current-gen');
    const bestScoreElement = document.getElementById('best-score');
    const aliveCountElement = document.getElementById('alive-count');
    
    if (currentGenElement) currentGenElement.textContent = generationInfo.generation.toString();
    if (bestScoreElement) bestScoreElement.textContent = Math.floor(generationInfo.bestScore).toString();
    if (aliveCountElement && gameState.snakes) {
      aliveCountElement.textContent = gameState.snakes.filter(s => s.alive).length.toString();
    }
  }, [generationInfo, gameState.snakes]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4">
      <h1 className="text-4xl font-bold mb-6 text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Neural Network Evolution Simulator
      </h1>
      
      <VictoryDisplay victories={victories} />
      
      <div className="flex flex-col lg:flex-row gap-8 items-start mt-4 w-full max-w-[1400px]">
        <GameVisualizer 
          gameState={gameState}
          startTime={startTime}
          isRecording={false}
          onSelectSnake={handleSelectSnake}
        />
        
        <div className="w-full lg:w-[420px] flex flex-col gap-5">
          <SnakeVisualizer
            snakes={gameState.snakes || []}
            activeSnake={activeSnake}
            onSelectSnake={handleSelectSnake}
          />
          
          <LearningHistory activeSnake={activeSnake} />
          
          <GenerationInfo
            generation={generationInfo.generation}
            bestScore={Math.floor(generationInfo.bestScore)}
            progress={generationInfo.progress}
            snakeCount={gameState.snakes?.filter(s => s.alive).length || 0}
            appleCount={gameState.apples?.length || 0}
          />
        </div>
      </div>
      
      <GameControls
        onInitializeGame={handleInitializeGame}
        isInitializing={isInitializing}
      />
    </div>
  );
};

export default Index;
