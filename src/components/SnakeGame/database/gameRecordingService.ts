
import { supabase } from "../../../integrations/supabase/client";
import { GameState, Snake } from "../types";

// Tipo de datos para la grabación
export interface GameRecording {
  id: string;
  created_at: string;
  game_data: GameRecordingData;
  duration: number;
  max_score: number;
  generation: number;
  snake_count: number;
  apple_count: number;
  winner_id: number | null;
  winner_color: string | null;
  total_moves: number;
  apples_eaten: number;
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
  };
}

// Datos de la grabación
export interface GameRecordingData {
  frames: GameState[];
  startTime: number;
  endTime: number;
  initialGeneration: number;
  finalScores: {
    id: number;
    score: number;
    color: string;
    survived: boolean;
    generation: number;
  }[];
}

// Clase para manejar la grabación de partidas
export class GameRecorder {
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

  // Guardado de grabación en Supabase
  async saveRecording(recording: GameRecordingData, metadata?: any): Promise<string | null> {
    if (!recording || recording.frames.length === 0) {
      console.error("No hay datos para guardar");
      return null;
    }

    try {
      // Calcular estadísticas
      const duration = recording.endTime - recording.startTime;
      const finalScores = recording.finalScores;
      const maxScore = Math.max(...finalScores.map(score => score.score));
      const totalApplesEaten = finalScores.reduce((sum, score) => sum + score.score, 0);
      
      // Identificar ganador
      const winners = finalScores.filter(score => score.score === maxScore && score.score > 0);
      const winner = winners.length > 0 ? winners[0] : null;

      // Datos a guardar
      const gameRecordingData = {
        game_data: recording,
        duration,
        max_score: maxScore,
        generation: recording.initialGeneration,
        snake_count: finalScores.length,
        apple_count: recording.frames[0].apples.length,
        winner_id: winner ? winner.id : null,
        winner_color: winner ? winner.color : null,
        total_moves: recording.frames.length,
        apples_eaten: totalApplesEaten,
        metadata: metadata || {}
      };

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('game_recordings')
        .insert(gameRecordingData)
        .select('id')
        .single();

      if (error) {
        console.error("Error al guardar grabación:", error);
        return null;
      }

      console.log(`Grabación guardada con ID: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error("Error al procesar grabación:", error);
      return null;
    }
  }

  // Obtener listado de grabaciones
  static async getRecordings(limit = 10, offset = 0): Promise<GameRecording[]> {
    try {
      const { data, error } = await supabase
        .from('game_recordings')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error al obtener grabaciones:", error);
        return [];
      }

      return data as GameRecording[];
    } catch (error) {
      console.error("Error al procesar la consulta:", error);
      return [];
    }
  }

  // Obtener una grabación específica
  static async getRecording(id: string): Promise<GameRecording | null> {
    try {
      const { data, error } = await supabase
        .from('game_recordings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error al obtener grabación:", error);
        return null;
      }

      return data as GameRecording;
    } catch (error) {
      console.error("Error al procesar la consulta:", error);
      return null;
    }
  }

  // Método para exportar la grabación como archivo
  static createRecordingDownload(recording: GameRecording): void {
    const blob = new Blob([JSON.stringify(recording, null, 2)], { type: 'application/json' });
    
    // Crear nombre descriptivo para el archivo
    const date = new Date(recording.created_at).toISOString().split('T')[0];
    const scoreInfo = recording.max_score > 0 ? `-score${recording.max_score}` : '';
    const genInfo = `-gen${recording.generation}`;
    const filename = `snake-recording-${date}${scoreInfo}${genInfo}.json`;
    
    // Generar enlace de descarga
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
