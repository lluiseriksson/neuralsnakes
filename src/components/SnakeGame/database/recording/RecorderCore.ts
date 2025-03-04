
import { GameState } from "../../types";
import { GameRecordingData } from "./types";

export class RecorderCore {
  private frames: GameState[] = [];
  private isRecording: boolean = false;
  private startTime: number = 0;
  private initialGeneration: number = 0;

  // Iniciar grabación
  startRecording(initialGameState: GameState) {
    this.frames = [];
    this.isRecording = true;
    this.startTime = Date.now();
    
    // Safely get max generation with fallbacks
    try {
      this.initialGeneration = Math.max(
        ...initialGameState.snakes
          .map(snake => {
            // Add null/undefined checks for snake.brain
            if (!snake.brain || typeof snake.brain.getGeneration !== 'function') {
              console.warn(`Snake ${snake.id} has invalid brain, using generation 1`);
              return 1;
            }
            return snake.brain.getGeneration() || 1;
          }),
        1 // Fallback minimum value
      );
    } catch (error) {
      console.error("Error getting initial generation:", error);
      this.initialGeneration = 1; // Default fallback
    }
    
    // Crear copia profunda del estado inicial
    this.addFrame(this.deepCloneGameState(initialGameState));
    console.log("🎥 Grabación iniciada");
  }

  // Detener grabación
  stopRecording(): GameRecordingData | null {
    if (!this.isRecording || this.frames.length === 0) {
      console.log("No hay grabación activa para detener");
      return null;
    }

    const endTime = Date.now();
    this.isRecording = false;

    // Obtener últimos datos
    const lastFrame = this.frames[this.frames.length - 1];
    
    // Safely extract final scores with error handling
    const finalScores = lastFrame.snakes.map(snake => {
      try {
        return {
          id: snake.id,
          score: snake.score,
          color: snake.color,
          survived: snake.alive,
          generation: snake.brain && typeof snake.brain.getGeneration === 'function' 
            ? snake.brain.getGeneration() 
            : 1
        };
      } catch (error) {
        console.error(`Error getting data for snake ${snake.id}:`, error);
        return {
          id: snake.id,
          score: snake.score || 0,
          color: snake.color || '#CCCCCC',
          survived: !!snake.alive,
          generation: 1
        };
      }
    });

    const recording: GameRecordingData = {
      frames: this.frames,
      startTime: this.startTime,
      endTime,
      initialGeneration: this.initialGeneration,
      finalScores
    };

    console.log(`🎥 Grabación finalizada con ${this.frames.length} frames`);
    return recording;
  }

  // Añadir un frame a la grabación
  addFrame(gameState: GameState): void {
    if (!this.isRecording) return;
    
    // Crear copia profunda del estado
    const frameCopy = this.deepCloneGameState(gameState);
    this.frames.push(frameCopy);
  }

  // Crear copia profunda del estado para evitar referencias
  private deepCloneGameState(gameState: GameState): GameState {
    try {
      // Simplificar datos para grabación (eliminar referencias circulares y funciones)
      const snakes = gameState.snakes.map(snake => {
        try {
          return {
            id: snake.id,
            positions: [...snake.positions.map(pos => ({ ...pos }))],
            direction: snake.direction,
            color: snake.color,
            score: snake.score,
            alive: snake.alive,
            gridSize: snake.gridSize,
            // Omitir brain completo, guardar solo datos mínimos con protección
            brain: {
              generation: (snake.brain && typeof snake.brain.getGeneration === 'function') 
                ? snake.brain.getGeneration() 
                : 1,
              score: snake.score,
              bestScore: (snake.brain && typeof snake.brain.getBestScore === 'function')
                ? snake.brain.getBestScore()
                : snake.score
            },
            decisionMetrics: snake.decisionMetrics ? { ...snake.decisionMetrics } : undefined
          };
        } catch (error) {
          console.error(`Error cloning snake ${snake.id}:`, error);
          // Return minimal valid snake object on error
          return {
            id: snake.id,
            positions: snake.positions ? [...snake.positions.map(pos => ({ ...pos }))] : [{ x: 0, y: 0 }],
            direction: snake.direction || 'RIGHT',
            color: snake.color || '#CCCCCC',
            score: snake.score || 0,
            alive: !!snake.alive,
            gridSize: snake.gridSize || 30,
            brain: { generation: 1, score: 0, bestScore: 0 }
          };
        }
      });

      const apples = gameState.apples.map(apple => ({
        position: { ...apple.position }
      }));

      return {
        snakes: snakes as any,
        apples,
        gridSize: gameState.gridSize
      };
    } catch (error) {
      console.error("Error in deepCloneGameState:", error);
      // Return minimal valid gameState on error
      return {
        snakes: [],
        apples: [],
        gridSize: gameState.gridSize || 30
      };
    }
  }
}
