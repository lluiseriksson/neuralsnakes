
import { RecorderCore } from "./RecorderCore";
import { RecorderStorage } from "./RecorderStorage";
import { RecorderExport } from "./RecorderExport";
import { GameRecording, GameRecordingData } from "./types";
import { GameState } from "../../types";

// Class for managing game recordings
export class GameRecorder {
  private recorderCore: RecorderCore = new RecorderCore();

  // Start recording - delegate to RecorderCore
  startRecording(initialGameState: GameState): void {
    this.recorderCore.startRecording(initialGameState);
  }

  // Stop recording - delegate to RecorderCore
  stopRecording(): GameRecordingData | null {
    return this.recorderCore.stopRecording();
  }

  // Add a frame - delegate to RecorderCore
  addFrame(gameState: GameState): void {
    try {
      this.recorderCore.addFrame(gameState);
    } catch (error) {
      console.error("Error adding frame to recording:", error);
    }
  }

  // Save recording - delegate to RecorderStorage
  async saveRecording(recording: GameRecordingData, metadata?: any): Promise<string | null> {
    try {
      return await RecorderStorage.saveRecording(recording, metadata);
    } catch (error) {
      console.error("Error saving recording:", error);
      return null;
    }
  }

  // Static methods - delegated to RecorderStorage and RecorderExport
  static async getRecordings(limit = 10, offset = 0): Promise<GameRecording[]> {
    try {
      return await RecorderStorage.getRecordings(limit, offset);
    } catch (error) {
      console.error("Error fetching recordings:", error);
      return [];
    }
  }

  static async getRecording(id: string): Promise<GameRecording | null> {
    try {
      return await RecorderStorage.getRecording(id);
    } catch (error) {
      console.error("Error fetching recording:", error);
      return null;
    }
  }

  static createRecordingDownload(recording: GameRecording): void {
    try {
      RecorderExport.createRecordingDownload(recording);
    } catch (error) {
      console.error("Error creating recording download:", error);
    }
  }
}
