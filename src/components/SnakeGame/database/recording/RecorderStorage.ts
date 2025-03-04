
import { supabase } from "../../../../integrations/supabase/client";
import { GameRecordingData, GameRecording, GameRecordingDataJson } from "./types";
import { Json } from "../../../../integrations/supabase/types";

export class RecorderStorage {
  // Guardado de grabación en Supabase
  static async saveRecording(recording: GameRecordingData, metadata?: any): Promise<string | null> {
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

      // Datos a guardar - asegurarnos de que es compatible con Json
      const gameRecordingData = {
        game_data: recording as unknown as Json,
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

      // Convertir tipos de datos
      return (data as unknown) as GameRecording[];
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

      // Convertir tipos de datos
      return (data as unknown) as GameRecording;
    } catch (error) {
      console.error("Error al procesar la consulta:", error);
      return null;
    }
  }
}
