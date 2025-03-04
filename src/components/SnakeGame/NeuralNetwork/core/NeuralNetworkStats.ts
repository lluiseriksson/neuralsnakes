
export class NetworkStats {
  private learningAttempts: number = 0;
  private successfulMoves: number = 0;
  private failedMoves: number = 0;
  private score: number = 0;
  private bestScore: number = 0;
  private gamesPlayed: number = 0;
  private generation: number = 1;
  private learningRate: number = 0.3;
  private lastPredictions: number[] = [];
  private lastScoreUpdate: number = Date.now();

  constructor(
    score?: number, 
    generation?: number,
    bestScore?: number,
    gamesPlayed?: number
  ) {
    if (score !== undefined) this.score = score;
    if (generation !== undefined) this.generation = generation;
    if (bestScore !== undefined) this.bestScore = bestScore;
    if (gamesPlayed !== undefined) this.gamesPlayed = gamesPlayed;
    
    if (generation && generation > 50) {
      this.learningRate = Math.max(0.05, 0.3 - (generation / 1000));
      console.log(`Network (gen ${generation}) using adaptive learning rate: ${this.learningRate.toFixed(4)}`);
    }
  }

  // Stats getters and setters
  getLearningRate(): number {
    return this.learningRate;
  }

  setLearningRate(rate: number): void {
    this.learningRate = rate;
  }
  
  setLastPredictions(predictions: number[]): void {
    this.lastPredictions = [...predictions];
  }
  
  getLastPredictions(): number[] {
    return [...this.lastPredictions];
  }
  
  getScore(): number {
    return this.score;
  }
  
  setScore(score: number): void {
    // Only update if it's been at least 100ms since the last update to prevent too frequent updates
    const now = Date.now();
    if (now - this.lastScoreUpdate >= 100) {
      this.score = score;
      this.lastScoreUpdate = now;
      
      // Also update best score if needed
      if (score > this.bestScore) {
        this.bestScore = score;
        console.log(`New best score: ${this.bestScore} for generation ${this.generation}`);
      }
    }
  }
  
  getGeneration(): number {
    return this.generation;
  }
  
  updateGeneration(generation: number): void {
    this.generation = generation;
    this.learningRate = Math.max(0.05, 0.3 - (generation / 1000));
  }
  
  getBestScore(): number {
    return this.bestScore;
  }
  
  updateBestScore(score: number): void {
    if (score > this.bestScore) {
      this.bestScore = score;
      console.log(`Updated best score: ${this.bestScore} for generation ${this.generation}`);
    }
  }
  
  getGamesPlayed(): number {
    return this.gamesPlayed;
  }
  
  setGamesPlayed(count: number): void {
    this.gamesPlayed = count;
  }
  
  getProgressPercentage(): number {
    const perfectScore = 50;
    return Math.min(100, (this.bestScore / perfectScore) * 100);
  }

  trackLearningAttempt(success: boolean): void {
    this.learningAttempts++;
    if (success) {
      this.successfulMoves++;
    } else {
      this.failedMoves++;
    }
  }

  getPerformanceStats(): { learningAttempts: number, successfulMoves: number, failedMoves: number } {
    return {
      learningAttempts: this.learningAttempts,
      successfulMoves: this.successfulMoves,
      failedMoves: this.failedMoves
    };
  }
}
