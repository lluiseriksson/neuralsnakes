
import React, { useCallback, useEffect, useState } from "react";
import { useGameLogic } from "../components/SnakeGame/hooks/useGameLogic";
import GameCanvas from "../components/SnakeGame/GameCanvas";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";
import VictoryDisplay from "../components/SnakeGame/components/VictoryDisplay";
import Timer from "../components/SnakeGame/components/Timer";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";

const Index = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const { gameState, victories, startTime, generationInfo, initializeGame, restartGame, isGameRunning } = useGameLogic();
  const { toast } = useToast();
  
  // Función segura para inicializar el juego
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
  
  // Inicializar el juego al cargar el componente
  useEffect(() => {
    console.log("Componente Index montado");
    
    const timer = setTimeout(() => {
      console.log("Iniciando juego automáticamente después de time out");
      handleInitializeGame();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [handleInitializeGame]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Snake AI Battle</h1>
      
      <VictoryDisplay victories={victories} />
      
      <div className="relative">
        <Timer startTime={startTime} />
        
        <div className="border-2 border-gray-700 rounded-lg overflow-hidden">
          {gameState.snakes && gameState.snakes.length > 0 ? (
            <GameCanvas gameState={gameState} />
          ) : (
            <div className="w-[600px] h-[600px] flex items-center justify-center bg-gray-900 text-white">
              Cargando juego...
            </div>
          )}
        </div>
      </div>
      
      <ScoreBoard snakes={gameState.snakes || []} generationInfo={generationInfo} />
      
      {/* Información de generación */}
      <div className="mt-4 p-2 bg-gray-800 rounded text-white">
        <p>Generación: {generationInfo.generation} | Mejor puntuación: {generationInfo.bestScore}</p>
        <div className="w-full bg-gray-700 h-2 mt-1 rounded-full">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${Math.min(generationInfo.progress * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Botones de control */}
      <div className="flex gap-4 mt-4">
        <Button 
          onClick={handleInitializeGame} 
          disabled={isInitializing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {isInitializing ? 'Iniciando...' : 'Reiniciar Juego'}
        </Button>
        
        <Button
          onClick={restartGame}
          disabled={isInitializing || !isGameRunning}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Terminar Ronda
        </Button>
      </div>
      
      {/* Indicador de estado */}
      <div className="mt-2 text-sm text-white">
        {gameState.snakes && gameState.snakes.length > 0 
          ? `${gameState.snakes.filter(s => s && s.alive).length} serpientes activas` 
          : 'No hay serpientes activas'}
      </div>
    </div>
  );
};

export default Index;
