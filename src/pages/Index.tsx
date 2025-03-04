
import React, { useCallback, useEffect, useState } from "react";
import { useGameLogic } from "../components/SnakeGame/hooks/useGameLogic";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";
import VictoryDisplay from "../components/SnakeGame/components/VictoryDisplay";
import { useToast } from "../components/ui/use-toast";
import { Snake } from "../components/SnakeGame/types";
import GameVisualizer from "../components/SnakeGame/components/GameVisualizer";
import SnakeVisualizer from "../components/SnakeGame/components/SnakeVisualizer";
import GenerationInfo from "../components/SnakeGame/components/GenerationInfo";
import RecordingControls from "../components/SnakeGame/components/RecordingControls";
import GameControls from "../components/SnakeGame/components/GameControls";

const Index = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeSnake, setActiveSnake] = useState<Snake | null>(null);
  const { 
    gameState, 
    victories, 
    startTime, 
    generationInfo, 
    initializeGame, 
    restartGame, 
    isGameRunning,
    startRecording,
    stopRecording,
    isRecording
  } = useGameLogic();
  const { toast } = useToast();
  
  const handleInitializeGame = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    console.log("Solicitando inicialización del juego desde Index...");
    
    try {
      toast({
        title: "Iniciando juego",
        description: "Generando serpientes y preparando el tablero..."
      });
      
      await initializeGame();
      console.log("Inicialización completada desde Index");
      
      toast({
        title: "¡Juego iniciado!",
        description: `${gameState.snakes?.length || 0} serpientes están listas para competir (Generación ${generationInfo.generation})`
      });
    } catch (error) {
      console.error("Error en la inicialización desde Index:", error);
      toast({
        title: "Error al inicializar",
        description: "Hubo un problema al iniciar el juego. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  }, [initializeGame, isInitializing, gameState.snakes, toast, generationInfo]);
  
  const handleStartRecording = useCallback(() => {
    if (isRecording) {
      return;
    }
    
    startRecording();
    toast({
      title: "Grabación iniciada",
      description: "Se está grabando la partida actual."
    });
  }, [isRecording, startRecording, toast]);
  
  const handleStopRecording = useCallback(async () => {
    if (!isRecording) {
      return;
    }
    
    await stopRecording();
  }, [isRecording, stopRecording]);
  
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
    if (bestScoreElement) bestScoreElement.textContent = generationInfo.bestScore.toString();
    if (aliveCountElement && gameState.snakes) {
      aliveCountElement.textContent = gameState.snakes.filter(s => s.alive).length.toString();
    }
  }, [generationInfo, gameState.snakes]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4">
      <h1 className="text-3xl font-bold mb-4 text-white bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Snake AI Battle</h1>
      
      <VictoryDisplay victories={victories} />
      
      <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
        <GameVisualizer 
          gameState={gameState}
          startTime={startTime}
          isRecording={isRecording}
          onSelectSnake={handleSelectSnake}
        />
        
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
          <SnakeVisualizer
            snakes={gameState.snakes || []}
            activeSnake={activeSnake}
            onSelectSnake={handleSelectSnake}
          />
          
          <ScoreBoard snakes={gameState.snakes || []} generationInfo={generationInfo} />
          
          <GenerationInfo
            generation={generationInfo.generation}
            bestScore={generationInfo.bestScore}
            progress={generationInfo.progress}
            snakeCount={gameState.snakes?.filter(s => s.alive).length || 0}
            appleCount={gameState.apples?.length || 0}
          />
          
          <RecordingControls
            isRecording={isRecording}
            isGameRunning={isGameRunning}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        </div>
      </div>
      
      <GameControls
        onInitializeGame={handleInitializeGame}
        onRestartGame={restartGame}
        isInitializing={isInitializing}
        isGameRunning={isGameRunning}
      />
    </div>
  );
};

export default Index;
