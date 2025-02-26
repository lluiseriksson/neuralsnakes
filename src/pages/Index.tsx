
import { useGameLogic } from "../components/SnakeGame/hooks/useGameLogic";
import GameCanvas from "../components/SnakeGame/GameCanvas";
import ScoreBoard from "../components/SnakeGame/ScoreBoard";
import VictoryDisplay from "../components/SnakeGame/components/VictoryDisplay";
import Timer from "../components/SnakeGame/components/Timer";

const Index = () => {
  const { gameState, victories, startTime } = useGameLogic();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Snake AI Battle</h1>
      <VictoryDisplay victories={victories} />
      <div className="relative">
        <Timer startTime={startTime} />
        <GameCanvas gameState={gameState} />
      </div>
      <ScoreBoard snakes={gameState.snakes} />
    </div>
  );
};

export default Index;
