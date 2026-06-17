// Base element type for all Excalidraw shapes
export interface ExcalidrawElement {
  id: string;
  type: 'rectangle' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'free_draw' | 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'hachure' | 'solid' | 'none' | 'cross-hatch';
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted'; // Border style
  roughness: number; // Hand-drawn feel control (0-1)
  seed: number; // Random seed for consistent rendering
  visible: boolean;
  locked: boolean;
  opacity: number; // Opacity level (0-100)
  cornerRadius: number; // Corner radius for rectangles
  layerId: string; // Layer ID associated with the element
  strokeSharpness: 'round' | 'sharp'; // Stroke sharpness for lines
  text?: string; // Text content for text elements
  fontSize?: number; // Font size for text elements
  fontFamily?: string; // Font family for text elements
  textAlign?: 'left' | 'center' | 'right'; // Text alignment for text elements
  imageUrl?: string; // Image URL for image elements
}

// Resize handle positions
export type ResizeHandle = 
  | 'nw' | 'n' | 'ne' 
  | 'w' | 'e' 
  | 'sw' | 's' | 'se' 
  | 'rotation';

// Free draw element with points
export interface FreeDrawElement extends ExcalidrawElement {
  type: 'free_draw';
  points: [number, number, number][]; // [x, y, pressure]
}

// Layer interface
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  isGroup?: boolean;
  children?: Layer[];
}

// Brush interface
export interface Brush {
  id: string;
  name: string;
  group: string;
  size: number;
  opacity: number;
  texture?: string;
}



// Tool settings interface for tool-specific parameters
export interface ToolSettings {
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  cornerRadius: number;
  roughness: number;
  brushSize: number;
  brushOpacity: number;
  fillStyle: 'hachure' | 'solid' | 'none' | 'cross-hatch';
}

// Tool types
export type ToolType = 'brush' | 'eraser' | 'rectangle' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'selection' | 'fill' | 'text' | 'image' | 'hand';

// Panel types
export type PanelType = 'layers' | 'brushes' | 'color' | 'settings' | 'none';

// Project interface
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// App state
export interface AppState {
  currentTool: ToolType;
  activePanel: PanelType;
  activeLayerId: string;
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  canvasScale: number;
  canvasRotation: number;
  layers: Layer[];
  elements: ExcalidrawElement[];
  activeElement: ExcalidrawElement | null;
  isDrawing: boolean;
  roughness: number;
  strokeSharpness: 'round' | 'sharp';
  undoTrigger: number;
  redoTrigger: number;
  // Project state
  projects: Project[];
  currentProjectId: string | null;
  // Animation state
  animation: {
    isPlaying: boolean;
    currentFrameIndex: number;
    fps: number;
    onionSkin: boolean;
    mode: 'frame' | 'tween';
  };
  frames: Array<{
    id: string;
    name: string;
    visible: boolean;
    elements: ExcalidrawElement[];
    duration?: number;
  }>;
}