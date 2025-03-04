import React, { useCallback, useEffect, useState } from "react";
import { useGameLogic } from "../components/SnakeGame/hooks/useGameLogic";
import GameCanvas from "../components/SnakeGame/GameCanvas";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";
import VictoryDisplay from "../components/SnakeGame/components/VictoryDisplay";
import Timer from "../components/SnakeGame/components/Timer";
import NeuralNetworkVisualizer from "../components/SnakeGame/components/NeuralNetworkVisualizer";
import SnakeSelector from "../components/SnakeGame/components/SnakeSelector";
import GenerationTracker from "../components/SnakeGame/components/GenerationTracker";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { Snake } from "../components/SnakeGame/types";
import { Link } from "react-router-dom";
import { Circle, StopCircle, Database, Download } from "lucide-react";

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
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4">
      <h1 className="text-3xl font-bold mb-4 text-white bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Snake AI Battle</h1>
      
      <VictoryDisplay victories={victories} />
      
      {gameState.snakes && gameState.snakes.length > 0 && (
        <GenerationTracker snakes={gameState.snakes} />
      )}
      
      <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
        <div className="relative bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-xl">
          <Timer startTime={startTime} />
          
          {isRecording && (
            <div className="absolute top-2 right-2 flex items-center bg-red-900/80 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse z-10">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              REC
            </div>
          )}
          
          <div className="overflow-hidden">
            {gameState.snakes && gameState.snakes.length > 0 ? (
              <GameCanvas gameState={gameState} onSelectSnake={handleSelectSnake} />
            ) : (
              <div className="w-[600px] h-[600px] flex items-center justify-center bg-gray-900 text-white animate-pulse">
                <div className="text-center">
                  <div className="inline-block mb-4 w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                  <p className="text-xl">Cargando juego...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
            <h3 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-2">Visualización de Decisiones</h3>
            <SnakeSelector 
              snakes={gameState.snakes || []} 
              onSelectSnake={handleSelectSnake} 
              activeSnakeId={activeSnake?.id || null} 
            />
            <NeuralNetworkVisualizer activeSnake={activeSnake} />
          </div>
          
          <ScoreBoard snakes={gameState.snakes || []} generationInfo={generationInfo} />
          
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
            <div className="flex justify-between items-center mb-1">
              <p className="text-lg">Generación: <span className="font-bold text-yellow-400">{generationInfo.generation}</span></p>
              <p className="text-lg">Mejor: <span className="font-bold text-green-400">{generationInfo.bestScore}</span></p>
            </div>
            
            <div className="w-full bg-gray-800 h-3 mt-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(generationInfo.progress * 100, 100)}%` }}
              ></div>
            </div>
            
            <div className="mt-2 text-xs text-gray-300 flex justify-between">
              <span>Progreso IA: {Math.round(generationInfo.progress * 100)}%</span>
              <span>{gameState.snakes?.filter(s => s.alive).length || 0} serpientes activas</span>
              <span>Manzanas: {gameState.apples?.length || 0}</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 shadow-lg text-white">
            <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Herramientas de grabación</h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleStartRecording}
                  disabled={isRecording || !isGameRunning}
                  variant="destructive"
                  className="flex-1"
                >
                  <Circle className="w-4 h-4 mr-2" />
                  Iniciar grabación
                </Button>
                
                <Button
                  onClick={handleStopRecording}
                  disabled={!isRecording}
                  variant="outline"
                  className="flex-1 border-red-900 text-red-400"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Detener
                </Button>
              </div>
              
              <Link to="/recordings" className="w-full">
                <Button className="w-full bg-purple-700 hover:bg-purple-800">
                  <Database className="w-4 h-4 mr-2" />
                  Ver grabaciones
                </Button>
              </Link>
            </div>
            
            {isRecording && (
              <div className="mt-3 text-xs text-red-400 animate-pulse">
                Grabando partida actual...
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 mt-6">
        <Button 
          onClick={handleInitializeGame} 
          disabled={isInitializing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg border border-blue-400"
        >
          {isInitializing ? 'Iniciando...' : 'Reiniciar Juego'}
        </Button>
        
        <Button
          onClick={restartGame}
          disabled={isInitializing || !isGameRunning}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg border border-red-400"
        >
          Terminar Ronda
        </Button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-700 text-white text-sm max-w-2xl shadow-lg">
        <p className="font-bold mb-2 text-purple-400">Sistema de evolución neural:</p>
        <div className="grid grid-cols-2 gap-4">
          <ul className="list-disc list-inside mt-1 text-xs space-y-1 text-gray-300">
            <li className="text-yellow-400">Serpiente amarilla: modelo óptimo (mutación baja)</li>
            <li className="text-blue-400">Serpiente azul: modelo combinado (mutación media)</li>
            <li className="text-gray-400">Otras serpientes: modelos experimentales (mutación alta)</li>
          </ul>
          <div className="bg-gray-800 p-2 rounded text-xs">
            <p className="text-green-400 font-semibold mb-1">Información:</p>
            <p>Generación actual: {generationInfo.generation}</p>
            <p>Mejor puntuación: {generationInfo.bestScore}</p>
            <p>Serpientes vivas: {gameState.snakes?.filter(s => s.alive).length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
