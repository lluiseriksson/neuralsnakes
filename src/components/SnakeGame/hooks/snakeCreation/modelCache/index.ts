
// Augment window type for TypeScript to recognize our custom events
declare global {
  interface WindowEventMap {
    'update-highest-score': CustomEvent<{ score: number }>;
    'new-high-score': CustomEvent<{ score: number }>;
    'score-update': CustomEvent<{ score: number, bestScore: number }>;
  }
}

// Export the entire API from this index file
export * from './cacheManagement';
export * from './gameTracking';
export * from './generationTracking';
export * from './scoreTracking';

// This index file prevents circular dependencies
// Always import from this file instead of directly from the individual files
