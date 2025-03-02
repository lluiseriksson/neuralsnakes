
import { saveModelToDb, saveTrainingDataToDb } from "../../database/neuralNetworkDb";

export class NetworkPersistence {
  private id: string | null = null;
  
  constructor(id?: string | null) {
    if (id) this.id = id;
  }
  
  getId(): string | null {
    return this.id;
  }
  
  setId(id: string): void {
    this.id = id;
  }
  
  async save(
    weights: number[], 
    score: number, 
    generation: number, 
    bestScore: number, 
    gamesPlayed: number,
    performanceStats: { learningAttempts: number, successfulMoves: number, failedMoves: number, learningRate: number }
  ): Promise<string | null> {
    const metadata = {
      best_score: bestScore,
      games_played: gamesPlayed,
      performance: performanceStats
    };
    
    const id = await saveModelToDb(this.id, weights, score, generation, metadata);
    if (id) this.id = id;
    return id;
  }

  async saveTrainingData(inputs: number[], outputs: number[], success: boolean): Promise<void> {
    if (!this.id) return;
    await saveTrainingDataToDb(this.id, inputs, outputs, success);
  }
}
