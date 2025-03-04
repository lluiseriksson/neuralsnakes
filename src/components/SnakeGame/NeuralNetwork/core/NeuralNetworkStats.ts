
export class NetworkStats {
  private learningAttempts: number = 0;
  private successfulMoves: number = 0;
  private failedMoves: number = 0;
  private score: number = 0;
  private bestScore: number = 0;
  private gamesPlayed: number = 0;
  private generation: number = 5;
  private learningRate: number = 0.3;
  private lastPredictions: number[] = [];
  private lastScoreUpdate: number = Date.now();
  private recentDecisions: {success: boolean, time: number}[] = [];
  private lastUIUpdate: number = 0;

  constructor(
    score?: number, 
    generation?: number,
    bestScore?: number,
    gamesPlayed?: number
  ) {
    if (score !== undefined) this.score = score;
    if (generation !== undefined && generation >= 5) this.generation = generation;
    if (bestScore !== undefined) this.bestScore = bestScore;
    if (gamesPlayed !== undefined) this.gamesPlayed = gamesPlayed;
    
    // Adaptively reduce learning rate for higher generations
    // but don't limit the generation value itself
    if (generation && generation > 50) {
      this.learningRate = Math.max(0.05, 0.3 - (generation / 1000));
      console.log(`Network (gen ${generation}) using adaptive learning rate: ${this.learningRate.toFixed(4)}`);
    }
  }

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
    const now = Date.now();
    if (now - this.lastScoreUpdate >= 100) {
      this.score = score;
      this.lastScoreUpdate = now;
      
      if (score > this.bestScore) {
        this.bestScore = score;
        console.log(`New best score: ${this.bestScore} for generation ${this.generation}`);
        
        // Notify global score tracking through CustomEvent
        try {
          const scoreUpdateEvent = new CustomEvent('update-highest-score', { 
            detail: { score: score } 
          });
          window.dispatchEvent(scoreUpdateEvent);
        } catch (e) {
          console.warn("Couldn't update global highest score through event:", e);
        }
        
        // Also notify UI that score changed
        if (now - this.lastUIUpdate > 500) {
          this.lastUIUpdate = now;
          try {
            const scoreUpdateEvent = new CustomEvent('score-update', { 
              detail: { score: this.score, bestScore: this.bestScore } 
            });
            window.dispatchEvent(scoreUpdateEvent);
          } catch (e) {
            console.warn("Couldn't dispatch score update event:", e);
          }
        }
      }
    }
  }
  
  getGeneration(): number {
    return this.generation;
  }
  
  updateGeneration(generation: number): void {
    if (generation > this.generation) {
      console.log(`Updating network generation: ${this.generation} -> ${generation}`);
      this.generation = Math.max(5, generation);
      // Adjust learning rate based on new generation
      this.learningRate = Math.max(0.05, 0.3 - (this.generation / 1000));
    }
  }
  
  getBestScore(): number {
    return this.bestScore;
  }
  
  updateBestScore(score: number): void {
    if (score > this.bestScore) {
      this.bestScore = score;
      console.log(`Updated best score: ${this.bestScore} for generation ${this.generation}`);
      
      // Notify global score tracking through a custom event
      try {
        const scoreUpdateEvent = new CustomEvent('update-highest-score', { 
          detail: { score: score } 
        });
        window.dispatchEvent(scoreUpdateEvent);
      } catch (e) {
        console.warn("Couldn't update global highest score through event:", e);
      }
    }
  }
  
  getGamesPlayed(): number {
    return this.gamesPlayed;
  }
  
  setGamesPlayed(count: number): void {
    this.gamesPlayed = count;
  }
  
  getProgressPercentage(): number {
    // More meaningful progression calculation that scales with generation
    // But limit the display percentage to avoid UI issues
    const genProgress = Math.min((this.generation / 1000) * 70, 70);
    const scoreProgress = Math.min(this.bestScore / 20, 0.3) * 100;
    
    return Math.min(100, genProgress + scoreProgress);
  }

  trackLearningAttempt(success: boolean): void {
    this.learningAttempts++;
    this.recentDecisions.push({success, time: Date.now()});
    
    if (this.recentDecisions.length > 50) {
      this.recentDecisions.shift();
    }
    
    if (success) {
      this.successfulMoves++;
    } else {
      this.failedMoves++;
    }
  }

  getPerformanceStats(): { learningAttempts: number, successfulMoves: number, failedMoves: number } {
    const now = Date.now();
    const recentDecisions = this.recentDecisions.filter(d => now - d.time < 20000);
    
    if (recentDecisions.length < 5) {
      return {
        learningAttempts: Math.max(this.learningAttempts, 10),
        successfulMoves: Math.max(this.successfulMoves, 1),
        failedMoves: this.failedMoves
      };
    }
    
    const recentSuccesses = recentDecisions.filter(d => d.success).length;
    
    return {
      learningAttempts: recentDecisions.length,
      successfulMoves: recentSuccesses,
      failedMoves: recentDecisions.length - recentSuccesses
    };
  }
}
