
import React, { useCallback, useMemo, useEffect } from "react";
import { useGameLogic } from "../components/SnakeGame/hooks/useGameLogic";
import GameCanvas from "../components/SnakeGame/GameCanvas";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";
import VictoryDisplay from "../components/SnakeGame/components/VictoryDisplay";
import Timer from "../components/SnakeGame/components/Timer";

const Index = () => {
  // Usar useGameLogic para manejar la lógica del juego
  const { gameState, victories, startTime, generationInfo, initializeGame } = useGameLogic();
  
  // Inicializar el juego al cargar el componente
  useEffect(() => {
    // Solo inicializar si no hay serpientes o si todas están muertas
    if (!gameState.snakes || gameState.snakes.length === 0 || 
        gameState.snakes.every(snake => !snake.alive)) {
      console.log("Inicializando juego desde el componente Index");
      initializeGame();
    }
  }, [gameState.snakes, initializeGame]);
  
  // Memorizar componentes para evitar re-renders innecesarios
  const timerComponent = useMemo(() => (
    <Timer startTime={startTime} />
  ), [startTime]);
  
  const victoryComponent = useMemo(() => (
    <VictoryDisplay victories={victories} />
  ), [victories]);
  
  const canvasComponent = useCallback(() => (
    <GameCanvas gameState={gameState} />
  ), [gameState]);
  
  const scoreBoardComponent = useMemo(() => (
    <ScoreBoard snakes={gameState.snakes} generationInfo={generationInfo} />
  ), [gameState.snakes, generationInfo]);

  // Verificar que gameState.snakes existe y mostrar información
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
      <button 
        onClick={() => initializeGame()} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Reiniciar Juego
      </button>
    </div>
  );
};

// Exportar como componente memorizado para evitar re-renders innecesarios
export default React.memo(Index);
