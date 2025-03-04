
import { RecorderCore } from "./RecorderCore";
import { RecorderStorage } from "./RecorderStorage";
import { RecorderExport } from "./RecorderExport";
import { GameRecording, GameRecordingData } from "./types";

// Clase combinada para gestionar la grabación de partidas
export class GameRecorder {
  private recorderCore: RecorderCore = new RecorderCore();

  // Iniciar grabación - delegado a RecorderCore
  startRecording(initialGameState: any) {
    this.recorderCore.startRecording(initialGameState);
  }

  // Detener grabación - delegado a RecorderCore
  stopRecording(): GameRecordingData | null {
    return this.recorderCore.stopRecording();
  }

  // Añadir un frame - delegado a RecorderCore
  addFrame(gameState: any): void {
    this.recorderCore.addFrame(gameState);
  }

  // Guardar grabación - delegado a RecorderStorage
  async saveRecording(recording: GameRecordingData, metadata?: any): Promise<string | null> {
    return RecorderStorage.saveRecording(recording, metadata);
  }

  // Métodos estáticos - delegados a RecorderStorage y RecorderExport
  static async getRecordings(limit = 10, offset = 0): Promise<GameRecording[]> {
    return RecorderStorage.getRecordings(limit, offset);
  }

  static async getRecording(id: string): Promise<GameRecording | null> {
    return RecorderStorage.getRecording(id);
  }

  static createRecordingDownload(recording: GameRecording): void {
    RecorderExport.createRecordingDownload(recording);
  }
}

// Re-exportar tipos para facilitar el uso
export type { GameRecording, GameRecordingData } from "./types";
