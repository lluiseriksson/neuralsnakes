
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
      
      // Also persist to localStorage for better cross-session tracking
      try {
        localStorage.setItem('snake-highest-score', highestScoreAchieved.toString());
      } catch (e) {
        console.warn("Failed to save highest score to localStorage:", e);
      }
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
  // First try to get from localStorage for persistence between sessions
  if (typeof window !== 'undefined' && localStorage) {
    try {
      const storedScore = localStorage.getItem('snake-highest-score');
      if (storedScore) {
        const parsedScore = parseInt(storedScore, 10);
        if (!isNaN(parsedScore) && parsedScore > highestScoreAchieved) {
          highestScoreAchieved = parsedScore;
          console.log(`🔄 Restored highest score from localStorage: ${highestScoreAchieved}`);
        }
      }
    } catch (e) {
      console.warn("Failed to read highest score from localStorage:", e);
    }
  }
  
  return highestScoreAchieved;
};

/**
 * Resets the highest score to zero
 */
export const resetHighestScore = (): void => {
  console.log(`🔄 Resetting highest score from ${highestScoreAchieved} to 0`);
  highestScoreAchieved = 0;
  
  // Also clear from localStorage
  if (typeof window !== 'undefined' && localStorage) {
    try {
      localStorage.removeItem('snake-highest-score');
    } catch (e) {
      console.warn("Failed to clear highest score from localStorage:", e);
    }
  }
};

// Add a window type declaration for TypeScript
declare global {
  interface WindowEventMap {
    'update-highest-score': CustomEvent<{ score: number }>;
    'new-high-score': CustomEvent<{ score: number }>;
  }
}
