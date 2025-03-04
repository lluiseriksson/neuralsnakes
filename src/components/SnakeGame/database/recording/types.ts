
import { Json } from "../../../../integrations/supabase/types";
import { GameState, Snake } from "../../types";

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

// Para compatibilidad con Supabase
export type GameRecordingDataJson = Json;
