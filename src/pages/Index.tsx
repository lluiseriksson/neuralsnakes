
import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useGameLogic } from "../components/SnakeGame/hooks/useGameLogic";
import GameCanvas from "../components/SnakeGame/GameCanvas";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";
import VictoryDisplay from "../components/SnakeGame/components/VictoryDisplay";
import Timer from "../components/SnakeGame/components/Timer";
import { Button } from "../components/ui/button";

const Index = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const { gameState, victories, startTime, generationInfo, initializeGame } = useGameLogic();
  
  // Función segura para inicializar el juego
  const handleInitializeGame = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    console.log("Solicitando inicialización del juego desde Index...");
    
    try {
      await initializeGame();
      console.log("Inicialización completada desde Index");
    } catch (error) {
      console.error("Error en la inicialización desde Index:", error);
    } finally {
      setIsInitializing(false);
    }
  }, [initializeGame, isInitializing]);
  
  // Inicializar el juego al cargar el componente
  useEffect(() => {
    console.log("Componente Index montado, verificando si hay que inicializar el juego");
    if (!gameState.snakes || gameState.snakes.length === 0 || 
        gameState.snakes.every(snake => !snake.alive)) {
      console.log("No hay serpientes activas, iniciando juego");
      handleInitializeGame();
    } else {
      console.log(`Hay ${gameState.snakes.length} serpientes, no es necesario inicializar el juego`);
    }
  }, []);
  
  // Memorizar componentes para evitar re-renders innecesarios
  const timerComponent = useMemo(() => (
    <Timer startTime={startTime} />
  ), [startTime]);
  
  const victoryComponent = useMemo(() => (
    <VictoryDisplay victories={victories} />
  ), [victories]);
  
  const canvasComponent = useCallback(() => {
    console.log(`Renderizando canvas con ${gameState.snakes?.length || 0} serpientes`);
    return <GameCanvas gameState={gameState} />;
  }, [gameState]);
  
  const scoreBoardComponent = useMemo(() => (
    <ScoreBoard snakes={gameState.snakes} generationInfo={generationInfo} />
  ), [gameState.snakes, generationInfo]);

  // Debug: Mostrar información sobre las serpientes en cada render
  useEffect(() => {
    if (gameState.snakes) {
      console.log(`Cantidad de serpientes: ${gameState.snakes.length}`);
      gameState.snakes.forEach((snake, index) => {
        if (snake && snake.positions) {
          console.log(`Serpiente ${index} - Posiciones: ${snake.positions.length}, Viva: ${snake.alive}`);
        } else {
          console.log(`Serpiente ${index} inválida:`, snake);
        }
      });
    } else {
      console.log("No hay serpientes en el estado del juego");
    }
  }, [gameState.snakes]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Snake AI Battle</h1>
      {victoryComponent}
      <div className="relative">
        {timerComponent}
        <React.Suspense fallback={<div className="text-white">Cargando juego...</div>}>
          {canvasComponent()}
        </React.Suspense>
      </div>
      {scoreBoardComponent}
      
      {/* Botón para reiniciar el juego si es necesario */}
      <Button 
        onClick={handleInitializeGame} 
        disabled={isInitializing}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        {isInitializing ? 'Iniciando...' : 'Reiniciar Juego'}
      </Button>
      
      {/* Indicador de estado */}
      <div className="mt-2 text-sm text-white">
        {gameState.snakes && gameState.snakes.length > 0 
          ? `${gameState.snakes.filter(s => s.alive).length} serpientes activas` 
          : 'No hay serpientes activas'}
      </div>
    </div>
  );
};

// Exportar como componente memorizado para evitar re-renders innecesarios
export default React.memo(Index);
