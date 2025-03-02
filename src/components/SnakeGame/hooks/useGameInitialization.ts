
import { useCallback } from 'react';
import { GRID_SIZE, APPLE_COUNT } from '../constants';
import { GameState } from '../types';
import { generateApple } from './useAppleGeneration';
import { createSnake, generateSnakeSpawnConfig } from './snakeCreation';

// Cache para apples iniciales
const cachedInitialApples = Array.from({ length: APPLE_COUNT }, generateApple);

// Función para crear un cerebro de respaldo para una serpiente
const createFallbackSnake = (id: number, spawnX: number, spawnY: number, direction: string, color: string) => {
  return {
    id,
    positions: [{x: spawnX, y: spawnY}, {x: spawnX, y: spawnY+1}, {x: spawnX, y: spawnY+2}],
    direction,
    color,
    score: 0,
    brain: {
      predict: () => [Math.random(), Math.random(), Math.random(), Math.random()],
      learn: () => {},
      getGeneration: () => 1,
      getBestScore: () => 0,
      getProgressPercentage: () => 0,
      updateBestScore: () => {},
      updateGeneration: () => {},
      save: async () => "fallback-id"
    },
    alive: true,
    gridSize: GRID_SIZE
  };
};

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
        try {
          const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
          console.log(`Intentando crear serpiente ${i} en posición (${spawnX}, ${spawnY})`);
          
          try {
            const snake = await createSnake(i, spawnX, spawnY, direction, color);
            console.log(`Serpiente ${i} creada con éxito, posiciones: ${snake.positions.length}`);
            return snake;
          } catch (snakeError) {
            console.error(`Error creando serpiente ${i}, usando serpiente de respaldo:`, snakeError);
            // Si falla la creación, usar una serpiente de respaldo
            return createFallbackSnake(i, spawnX, spawnY, direction, color);
          }
        } catch (error) {
          console.error(`Error en configuración de serpiente ${i}:`, error);
          // Configuración de respaldo para la serpiente
          const backupConfig = [
            5 + i * 5, 5 + i * 3, 
            ["UP", "DOWN", "LEFT", "RIGHT"][i % 4], 
            ["#FFDD00", "#3388FF", "#FF3366", "#33CC66"][i % 4]
          ];
          console.log(`Usando configuración de respaldo para serpiente ${i}`);
          return createFallbackSnake(
            i, 
            backupConfig[0] as number, 
            backupConfig[1] as number, 
            backupConfig[2] as string, 
            backupConfig[3] as string
          );
        }
      });
      
      let snakes = await Promise.all(snakePromises);
      console.log(`Todas las serpientes creadas: ${snakes.length}`);
      
      // Verificar que todas las serpientes tienen posiciones válidas y cerebros
      snakes = snakes.map(snake => {
        if (!snake.positions || snake.positions.length === 0) {
          console.error(`Serpiente ${snake.id} no tiene posiciones válidas, aplicando corrección`);
          const [spawnX, spawnY] = generateSnakeSpawnConfig(snake.id);
          snake.positions = [{x: spawnX, y: spawnY}, {x: spawnX, y: spawnY+1}, {x: spawnX, y: spawnY+2}];
        }
        
        // Verificar que el cerebro tiene todas las funciones necesarias
        if (!snake.brain || !snake.brain.predict || !snake.brain.getGeneration) {
          console.error(`Serpiente ${snake.id} tiene cerebro inválido, aplicando cerebro de respaldo`);
          snake.brain = {
            predict: () => [Math.random(), Math.random(), Math.random(), Math.random()],
            learn: () => {},
            getGeneration: () => 1,
            getBestScore: () => 0,
            getProgressPercentage: () => 0,
            updateBestScore: () => {},
            updateGeneration: () => {},
            save: async () => "fallback-id"
          };
        }
        
        return snake;
      });
      
      // Actualizar estado del juego con las serpientes creadas
      setGameState({
        snakes,
        apples: [...cachedInitialApples],
        gridSize: GRID_SIZE,
      });
      
      // Actualizar información de generación con manejo seguro de cerebros nulos
      const generations = snakes.map(s => s.brain?.getGeneration?.() || 1);
      const scores = snakes.map(s => s.brain?.getBestScore?.() || 0);
      const progresses = snakes.map(s => s.brain?.getProgressPercentage?.() || 0);
      
      const highestGeneration = Math.max(...generations);
      const highestScore = Math.max(...scores);
      const highestProgress = Math.max(...progresses);
      
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
      console.error("Error crítico durante la inicialización del juego:", error);
      // Crear un estado básico del juego en caso de error
      const basicSnakes = Array.from({ length: 4 }, (_, i) => {
        const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
        return createFallbackSnake(i, spawnX, spawnY, direction, color);
      });
      
      setGameState({
        snakes: basicSnakes,
        apples: [...cachedInitialApples],
        gridSize: GRID_SIZE,
      });
      
      // Establecer información de generación por defecto
      setGenerationInfo({
        generation: 1,
        bestScore: 0,
        progress: 0
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
