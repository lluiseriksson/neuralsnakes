
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
      
      {/* Información de generación mejorada */}
      <div className="mt-4 p-3 bg-gray-800 rounded text-white">
        <div className="flex justify-between items-center mb-1">
          <p className="text-lg">Generación: {generationInfo.generation}</p>
          <p className="text-lg">Mejor puntuación: {generationInfo.bestScore}</p>
        </div>
        
        <div className="w-full bg-gray-700 h-3 mt-1 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(generationInfo.progress * 100, 100)}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-xs text-gray-300 flex justify-between">
          <span>Progreso IA: {Math.round(generationInfo.progress * 100)}%</span>
          <span>{gameState.snakes?.filter(s => s.alive).length || 0} serpientes activas</span>
          <span>Manzanas: {gameState.apples?.length || 0}</span>
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
      
      {/* Estado del aprendizaje */}
      <div className="mt-4 p-2 bg-gray-800 rounded text-white text-sm max-w-lg">
        <p>Estado del aprendizaje:</p>
        <ul className="list-disc list-inside mt-1 text-xs">
          <li>Serpiente roja: modelo óptimo (mutación baja)</li>
          <li>Serpiente azul: modelo combinado (mutación media)</li>
          <li>Otras serpientes: modelos experimentales (mutación alta)</li>
        </ul>
        <p className="mt-2 text-xs text-gray-300">Las serpientes aprenden continuamente de sus éxitos y errores. Las decisiones más efectivas se refuerzan para futuras generaciones.</p>
      </div>
    </div>
  );
};

export default Index;
