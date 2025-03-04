
// Track the highest score achieved across all games
let highestScoreAchieved = 0;

/**
 * Updates and returns the highest score achieved
 * @param score New score to compare with current highest
 * @returns Current highest score after comparison
 */
export const updateHighestScoreAchieved = (score: number): number => {
  if (score > highestScoreAchieved) {
    console.log(`🏆 New highest score achieved: ${score} (previous: ${highestScoreAchieved})`);
    highestScoreAchieved = score;
  }
  return highestScoreAchieved;
};

/**
 * Resets the highest score to zero
 */
export const resetHighestScore = (): void => {
  console.log(`🔄 Resetting highest score from ${highestScoreAchieved} to 0`);
  highestScoreAchieved = 0;
};
