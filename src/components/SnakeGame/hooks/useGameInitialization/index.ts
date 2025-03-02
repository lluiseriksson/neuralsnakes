
import { useCallback } from 'react';
import { GameState, Snake, Direction } from '../../types';
import { GRID_SIZE, APPLE_COUNT } from '../../constants';
import { generateApple } from '../useAppleGeneration';
import { createSnake, generateSnakeSpawnConfig } from '../snakeCreation';
import { validateAndFixSnake } from './validateSnake';
import { createFallbackSnake } from './createFallbackSnake';
import { getGenerationInfo } from './getGenerationInfo';
import { createEmergencyGameState } from './emergencyRecovery';

// Cache for initial apples
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
        try {
          const [spawnX, spawnY, direction, color] = generateSnakeSpawnConfig(i);
          console.log(`Intentando crear serpiente ${i} en posición (${spawnX}, ${spawnY})`);
          
          try {
            const snake = await createSnake(i, spawnX, spawnY, direction as Direction, color);
            console.log(`Serpiente ${i} creada con éxito, posiciones: ${snake.positions.length}`);
            return snake;
          } catch (snakeError) {
            console.error(`Error creando serpiente ${i}, usando serpiente de respaldo:`, snakeError);
            // Si falla la creación, usar una serpiente de respaldo
            return createFallbackSnake(i, spawnX, spawnY, direction as Direction, color);
          }
        } catch (error) {
          console.error(`Error en configuración de serpiente ${i}:`, error);
          // Configuración de respaldo para la serpiente
          const backupConfig = [
            5 + i * 5, 5 + i * 3, 
            ["UP", "DOWN", "LEFT", "RIGHT"][i % 4] as Direction, 
            ["#FFDD00", "#3388FF", "#FF3366", "#33CC66"][i % 4]
          ];
          console.log(`Usando configuración de respaldo para serpiente ${i}`);
          return createFallbackSnake(
            i, 
            backupConfig[0] as number, 
            backupConfig[1] as number, 
            backupConfig[2] as Direction, 
            backupConfig[3] as string
          );
        }
      });
      
      // Wait for all snakes to be created
      const snakes = await Promise.all(snakePromises);
      console.log(`Todas las serpientes creadas: ${snakes.length}`);
      
      // Validate and fix any snakes as needed
      const validatedSnakes = snakes.map(snake => validateAndFixSnake(snake));
      
      // Actualizar estado del juego con las serpientes creadas
      setGameState({
        snakes: validatedSnakes,
        apples: [...cachedInitialApples],
        gridSize: GRID_SIZE,
      });
      
      // Update generation information
      const generationData = getGenerationInfo(validatedSnakes);
      setGenerationInfo(generationData);

      setStartTime(Date.now());
      setIsGameRunning(true);
      isProcessingUpdate.current = false;
      
      console.log("Inicialización del juego completada con éxito");
    } catch (error) {
      console.error("Error crítico durante la inicialización del juego:", error);
      
      // Create basic game state in case of error
      const emergencyState = createEmergencyGameState();
      setGameState(emergencyState);
      
      // Set default generation information
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

export * from './createFallbackBrain';
export * from './createFallbackSnake';
export * from './validateSnake';
export * from './getGenerationInfo';
export * from './emergencyRecovery';
