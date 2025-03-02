
// Basic network node values
export interface NodeValues {
  inputs: number[];
  outputs: number[];
  inputLabels: string[];
  outputLabels: string[];
}

// Position of a node in the visualization
export type NodePosition = {
  x: number;
  y: number;
};

// Styling options for nodes
export interface NodeStylingOptions {
  radius?: number;
  isSelected?: boolean;
  isInput?: boolean;
  pulseEffect?: boolean;
  glowEffect?: boolean;
}

// Canvas dimensions and layout
export interface CanvasLayout {
  width: number;
  height: number;
  inputLayerX: number;
  outputLayerX: number;
  inputStartY: number;
  outputStartY: number;
  inputSpacing: number;
  outputSpacing: number;
  nodeRadius: number;
}

// Connection styling
export interface ConnectionStyle {
  opacity: number;
  width: number;
  dashPattern?: number[];
  flowSpeed?: number;
  color?: string;
  gradient?: boolean;
}

// Learning event for history visualization
export interface LearningEvent {
  type: string;
  reward?: number;
  time: number;
  position: { x: number; y: number };
  distanceDelta?: number;
  missedAppleCount?: number;
  penalty?: number;
  missedPositions?: { x: number; y: number }[];
}

// Result of drawing output nodes
export interface OutputDrawResult {
  positions: NodePosition[];
  selectedIndex: number;
}
