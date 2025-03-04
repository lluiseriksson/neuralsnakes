
// Track the highest score achieved across all games
let highestScoreAchieved = 0;

// Set up event listener for score updates when in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('update-highest-score', ((event: CustomEvent) => {
    if (event.detail && typeof event.detail.score === 'number') {
      updateHighestScoreAchieved(event.detail.score);
    }
  }) as EventListener);
  
  // Reset the highest score when the page loads
  window.addEventListener('load', () => {
    console.log("🔄 Resetting highest score on page load");
    resetHighestScore();
  });

  // Also reset on DOMContentLoaded for more reliable reset
  window.addEventListener('DOMContentLoaded', () => {
    console.log("🔄 Resetting highest score on DOMContentLoaded");
    resetHighestScore();
  });
}

/**
 * Updates and returns the highest score achieved
 * @param score New score to compare with current highest
 * @returns Current highest score after comparison
 */
export const updateHighestScoreAchieved = (score: number): number => {
  // Only update if the new score is higher and it's a valid number
  if (typeof score === 'number' && !isNaN(score) && score > highestScoreAchieved) {
    console.log(`🏆 New highest score achieved: ${score} (previous: ${highestScoreAchieved})`);
    highestScoreAchieved = score;
    
    // Emit an event that can be listened to
    try {
      const newHighScoreEvent = new CustomEvent('new-high-score', { 
        detail: { score: highestScoreAchieved } 
      });
      window.dispatchEvent(newHighScoreEvent);
    } catch (e) {
      console.error("Error emitting high score event:", e);
    }
  }
  return highestScoreAchieved;
};

/**
 * Gets the current highest score without updating it
 * @returns Current highest score
 */
export const getCurrentHighestScore = (): number => {
  return highestScoreAchieved;
};

/**
 * Resets the highest score to zero
 */
export const resetHighestScore = (): void => {
  console.log(`🔄 Resetting highest score from ${highestScoreAchieved} to 0`);
  highestScoreAchieved = 0;
};
