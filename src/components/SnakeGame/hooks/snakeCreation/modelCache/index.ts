
// Export the entire API from this index file
export * from './cacheManagement';
export * from './gameTracking';
export * from './generationTracking';
export * from './scoreTracking';

// This index file prevents circular dependencies
// Always import from this file instead of directly from the individual files
