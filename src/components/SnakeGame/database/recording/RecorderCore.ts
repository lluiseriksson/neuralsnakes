
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
    this.initialGeneration = Math.max(
      ...initialGameState.snakes.map(snake => snake.brain.getGeneration()),
      1
    );
    
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
    const finalScores = lastFrame.snakes.map(snake => ({
      id: snake.id,
      score: snake.score,
      color: snake.color,
      survived: snake.alive,
      generation: snake.brain.getGeneration()
    }));

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
    // Simplificar datos para grabación (eliminar referencias circulares y funciones)
    const snakes = gameState.snakes.map(snake => ({
      id: snake.id,
      positions: [...snake.positions.map(pos => ({ ...pos }))],
      direction: snake.direction,
      color: snake.color,
      score: snake.score,
      alive: snake.alive,
      gridSize: snake.gridSize,
      // Omitir brain completo, guardar solo datos mínimos
      brain: {
        generation: snake.brain.getGeneration(),
        score: snake.score,
        bestScore: snake.brain.getBestScore()
      },
      decisionMetrics: snake.decisionMetrics ? { ...snake.decisionMetrics } : undefined
    }));

    const apples = gameState.apples.map(apple => ({
      position: { ...apple.position }
    }));

    return {
      snakes: snakes as any,
      apples,
      gridSize: gameState.gridSize
    };
  }
}
