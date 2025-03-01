
import React, { useCallback, useMemo } from "react";
import { useGameLogic } from "../components/SnakeGame/hooks/useGameLogic";
import GameCanvas from "../components/SnakeGame/GameCanvas";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";
import VictoryDisplay from "../components/SnakeGame/components/VictoryDisplay";
import Timer from "../components/SnakeGame/components/Timer";

const Index = () => {
  // Usar useGameLogic para manejar la lógica del juego
  const { gameState, victories, startTime, generationInfo } = useGameLogic();
  
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
    </div>
  );
};

// Exportar como componente memorizado para evitar re-renders innecesarios
export default React.memo(Index);
