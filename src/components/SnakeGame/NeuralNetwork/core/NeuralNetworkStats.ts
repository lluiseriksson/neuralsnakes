
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
    
    // Try to get the best score from global tracking
    this.tryLoadGlobalBestScore();
  }
  
  private tryLoadGlobalBestScore(): void {
    // Try to get the best score from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedScore = localStorage.getItem('snake-highest-score');
        if (storedScore) {
          const parsedScore = parseInt(storedScore, 10);
          if (!isNaN(parsedScore) && parsedScore > this.bestScore) {
            this.bestScore = parsedScore;
            console.log(`Neural network loaded best score from localStorage: ${this.bestScore}`);
          }
        }
      } catch (e) {
        console.warn("Failed to read best score from localStorage:", e);
      }
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
        
        // Save to localStorage for cross-session persistence
        this.saveToLocalStorage();
        
        // Notify global score tracking through CustomEvent
        this.notifyScoreUpdate(score);
        
        // Also notify UI that score changed
        if (now - this.lastUIUpdate > 500) {
          this.lastUIUpdate = now;
          this.notifyUIUpdate();
        }
      }
    }
  }
  
  private saveToLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('snake-highest-score', this.bestScore.toString());
        console.log(`Saved best score to localStorage: ${this.bestScore}`);
      } catch (e) {
        console.warn("Failed to save best score to localStorage:", e);
      }
    }
  }
  
  private notifyScoreUpdate(score: number): void {
    try {
      const scoreUpdateEvent = new CustomEvent('update-highest-score', { 
        detail: { score: score } 
      });
      window.dispatchEvent(scoreUpdateEvent);
    } catch (e) {
      console.warn("Couldn't update global highest score through event:", e);
    }
  }
  
  private notifyUIUpdate(): void {
    try {
      const scoreUpdateEvent = new CustomEvent('score-update', { 
        detail: { score: this.score, bestScore: this.bestScore } 
      });
      window.dispatchEvent(scoreUpdateEvent);
    } catch (e) {
      console.warn("Couldn't dispatch score update event:", e);
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
      
      // Save to localStorage for cross-session persistence
      this.saveToLocalStorage();
      
      // Notify global score tracking through a custom event
      this.notifyScoreUpdate(score);
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
