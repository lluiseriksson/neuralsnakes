import { useCallback } from 'react';
import { GRID_SIZE, APPLE_COUNT } from '../constants';
import { GameState } from '../types';
import { generateApple } from './useAppleGeneration';
import { createSnake, generateSnakeSpawnConfig } from './snakeCreation';

// Cache para apples iniciales
const cachedInitialApples = Array.from({ length: APPLE_COUNT }, generateApple);

export const useGameInitialization = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  setStartTime: React.Dispatch<React.SetStateAction<number>>,
  setIsGameRunning: React.Dispatch<React.SetStateAction<boolean>>,
  setGenerationInfo: React.Dispatch<React.SetStateAction<{
    generation: number;
    bestScore: number;
    progress: number;
  }>>,
  gameLoopRef: React.MutableRefObject<NodeJS.Timeout | null>,
  isProcessingUpdate: React.MutableRefObject<boolean>,
  gamesPlayedRef: React.MutableRefObject<number>
) => {
  const initializeGame = useCallback(async () => {
    try {
      console.log("Iniciando inicialización del juego...");
      
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }

      gamesPlayedRef.current++;
      console.log(`Iniciando partida #${gamesPlayedRef.current}`);

      // Configuración inicial mientras las serpientes cargan
      setGameState(prevState => ({
        ...prevState,
        apples: [...cachedInitialApples],
        gridSize: GRID_SIZE,
      }));

      // Crear serpientes en paralelo para mejor rendimiento
      console.log("Creando 4 serpientes...");
      const snakePromises = Array.from({ length: 4 }, async (_, i) => {
        const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
        const snake = await createSnake(i, spawnX, spawnY, direction, color);
        console.log(`Serpiente ${i} creada con éxito, posiciones: ${snake.positions.length}`);
        return snake;
      });
      
      const snakes = await Promise.all(snakePromises);
      console.log(`Todas las serpientes creadas: ${snakes.length}`);
      
      // Verificar que todas las serpientes tienen posiciones válidas
      snakes.forEach(snake => {
        if (!snake.positions || snake.positions.length === 0) {
          console.error(`Serpiente ${snake.id} no tiene posiciones válidas`);
          // Corregir la serpiente con posiciones por defecto
          const [spawnX, spawnY] = generateSnakeSpawnConfig(snake.id);
          snake.positions = [{x: spawnX, y: spawnY}, {x: spawnX, y: spawnY+1}, {x: spawnX, y: spawnY+2}];
        }
      });
      
      // Actualizar estado del juego con las serpientes creadas
      setGameState({
        snakes,
        apples: [...cachedInitialApples],
        gridSize: GRID_SIZE,
      });
      
      // Actualizar información de generación
      const highestGeneration = Math.max(...snakes.map(s => s.brain.getGeneration()));
      const highestScore = Math.max(...snakes.map(s => s.brain.getBestScore()));
      const highestProgress = Math.max(...snakes.map(s => s.brain.getProgressPercentage()));
      
      setGenerationInfo({
        generation: highestGeneration,
        bestScore: highestScore,
        progress: highestProgress
      });

      setStartTime(Date.now());
      setIsGameRunning(true);
      isProcessingUpdate.current = false;
      
      console.log("Inicialización del juego completada con éxito");
    } catch (error) {
      console.error("Error durante la inicialización del juego:", error);
      // Crear un estado básico del juego en caso de error
      const basicSnakes = Array.from({ length: 4 }, (_, i) => {
        const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
        return {
          id: i,
          positions: [{x: spawnX, y: spawnY}, {x: spawnX, y: spawnY+1}, {x: spawnX, y: spawnY+2}],
          direction,
          color,
          score: 0,
          brain: null as any, // No podemos crear un cerebro correctamente aquí
          alive: true,
          gridSize: GRID_SIZE
        };
      });
      
      setGameState({
        snakes: basicSnakes,
        apples: [...cachedInitialApples],
        gridSize: GRID_SIZE,
      });
      
      setStartTime(Date.now());
      setIsGameRunning(true);
      isProcessingUpdate.current = false;
    }
  }, [
    gameLoopRef, 
    gamesPlayedRef, 
    setGameState, 
    setStartTime, 
    setIsGameRunning, 
    isProcessingUpdate,
    setGenerationInfo
  ]);

  return { initializeGame };
};
