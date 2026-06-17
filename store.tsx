import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Layer, ToolType, PanelType, Brush, ExcalidrawElement, ToolSettings, AppState, Project } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock Initial Data
const INITIAL_LAYERS: Layer[] = [
  { id: '1', name: '背景层', visible: true, locked: true, opacity: 100, blendMode: '正常' },
  { id: '2', name: '线稿', visible: true, locked: false, opacity: 100, blendMode: '正片叠底' },
  { id: '3', name: '上色', visible: true, locked: false, opacity: 100, blendMode: '正常' },
];

const INITIAL_BRUSHES: Brush[] = [
  { id: 'b1', name: 'HB 铅笔', group: '素描', size: 5, opacity: 100 },
  { id: 'b2', name: '单线笔', group: '书法', size: 10, opacity: 100 },
  { id: 'b3', name: '工作室笔', group: '着墨', size: 8, opacity: 100 },
  { id: 'b4', name: '柔边喷枪', group: '喷漆', size: 50, opacity: 50 },
];

// Initial elements (single frame)
const INITIAL_ELEMENTS: ExcalidrawElement[] = [];

interface StoreContextType extends AppState {
  setTool: (tool: ToolType) => void;
  togglePanel: (panel: PanelType) => void;
  setActiveLayer: (id: string) => void;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  setElements: React.Dispatch<React.SetStateAction<ExcalidrawElement[]>>;
  setFrames: React.Dispatch<React.SetStateAction<AppState['frames']>>;
  setActiveLayerId: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  addLayer: () => void;
  duplicateLayer: () => void;
  removeLayer: (id: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;
  setColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setBucketFillColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setBrushOpacity: (opacity: number) => void;
  setRoughness: (roughness: number) => void;
  setStrokeSharpness: (sharpness: 'round' | 'sharp') => void;
  setFillStyle: (style: 'hachure' | 'solid' | 'none' | 'cross-hatch') => void;
  setStrokeStyle: (style: 'solid' | 'dashed' | 'dotted') => void;
  setCornerRadius: (radius: number) => void;
  setCanvasScale: (scale: number) => void;
  addElement: (element: ExcalidrawElement) => void;
  updateElement: (elementId: string, updates: Partial<ExcalidrawElement>) => void;
  deleteElement: (elementId: string) => void;
  addElements: (elements: ExcalidrawElement[]) => void;
  updateElements: (updates: Array<{ elementId: string; updates: Partial<ExcalidrawElement> }>) => void;
  deleteElements: (elementIds: string[]) => void;
  saveSnapshot: () => void;
  setActiveElement: (element: ExcalidrawElement | null) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  clearCanvas: () => void;
  brushes: Brush[];
  activeBrushId: string;
  setActiveBrush: (id: string) => void;
  triggerUndo: () => void;
  triggerRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  fillStyle: 'hachure' | 'solid' | 'none' | 'cross-hatch';
  backgroundColor: string;
  fillColor: string;
  bucketFillColor: string;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  cornerRadius: number;
  toolSettings: Record<ToolType, ToolSettings>;
  animationFps: number;
  setAnimationFps: (fps: number) => void;
  onionSkin: boolean;
  toggleOnionSkin: () => void;
  setAnimation: (updates: Partial<AppState['animation']>) => void;
  // Project management functions
  addProject: (name: string) => void;
  switchProject: (projectId: string) => void;
  saveProject: () => void;
  loadProjects: () => void;
  deleteProject: (projectId: string) => void;
  renameProject: (projectId: string, newName: string) => void;
  duplicateProject: (projectId: string) => void;
  exportProject: (projectId: string) => string | null;
  importProject: (jsonStr: string) => boolean;
  currentProjectName: string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface UndoSnapshot {
  elements: ExcalidrawElement[];
  layers: Layer[];
  frames: AppState['frames'];
}


export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize tool-specific settings with default values
  const initialToolSettings: Record<ToolType, ToolSettings> = {
    brush: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 12, brushOpacity: 100, fillStyle: 'none' },
    eraser: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 20, brushOpacity: 100, fillStyle: 'none' },
    rectangle: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 2, brushOpacity: 100, fillStyle: 'none' },
    ellipse: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 2, brushOpacity: 100, fillStyle: 'none' },
    diamond: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 2, brushOpacity: 100, fillStyle: 'none' },
    line: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 2, brushOpacity: 100, fillStyle: 'none' },
    arrow: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 2, brushOpacity: 100, fillStyle: 'none' },
    selection: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 2, brushOpacity: 100, fillStyle: 'none' },
    fill: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 2, brushOpacity: 100, fillStyle: 'solid' },
    text: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 24, brushOpacity: 100, fillStyle: 'solid' },
    image: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 2, brushOpacity: 100, fillStyle: 'none' },
    hand: { strokeStyle: 'solid', cornerRadius: 0, roughness: 1, brushSize: 2, brushOpacity: 100, fillStyle: 'none' },
  };

  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS);
  const [activeLayerId, setActiveLayerId] = useState<string>('2');
  const [currentTool, setCurrentTool] = useState<ToolType>('brush');
  const [activePanel, setActivePanel] = useState<PanelType>('layers');
  const [brushColor, setBrushColor] = useState<string>('#3b82f6');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [fillColor, setFillColor] = useState<string>('#ffffff');
  const [bucketFillColor, setBucketFillColor] = useState<string>('#3b82f6');
  const [canvasScale, setCanvasScale] = useState<number>(1);
  const [canvasRotation, setCanvasRotation] = useState<number>(0);
  const [elements, setElements] = useState<ExcalidrawElement[]>(INITIAL_ELEMENTS);
  const [activeElement, setActiveElement] = useState<ExcalidrawElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [activeBrushId, setActiveBrushId] = useState<string>('b3');
  const [toolSettings, setToolSettings] = useState<Record<ToolType, ToolSettings>>(initialToolSettings);
  const [roughness, setRoughness] = useState<number>(1);
  const [strokeSharpness, setStrokeSharpness] = useState<'round' | 'sharp'>('round');
  const [fillStyle, setFillStyle] = useState<'hachure' | 'solid' | 'none' | 'cross-hatch'>('none');
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [cornerRadius, setCornerRadius] = useState<number>(0);

  // Animation playback state
  const [animationFps, setAnimationFps] = useState<number>(5); // Default to 5 FPS for better animation preview
  const [onionSkin, setOnionSkin] = useState<boolean>(false);
  const [animation, setAnimationState] = useState<AppState['animation']>({
    isPlaying: false,
    currentFrameIndex: 0,
    fps: 12,
    onionSkin: false,
    mode: 'frame'
  });
  const [frames, setFrames] = useState<AppState['frames']>([]);

  // Project state
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Update animation state helper
  const updateAnimation = (updates: Partial<AppState['animation']>) => {
    setAnimationState(prev => ({ ...prev, ...updates }));
  };

  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<UndoSnapshot[]>([]);

  // Get current tool's settings
  const currentToolSettings = toolSettings[currentTool];

  // Update current tool's specific settings
  const updateCurrentToolSetting = <K extends keyof ToolSettings>(key: K, value: ToolSettings[K]) => {
    setToolSettings(prev => ({
      ...prev,
      [currentTool]: {
        ...prev[currentTool],
        [key]: value
      }
    }));
  };

  // Tool management
  const setTool = (tool: ToolType) => {
    setCurrentTool(tool);
    // When selecting fill tool, automatically switch to color panel
    if (tool === 'fill') {
      setActivePanel('color');
    } else {
      // For all other tools, automatically switch to brushes panel
      setActivePanel('brushes');
    }
  };
  
  // Panel management
  const togglePanel = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? 'none' : panel);
  };

  // Layer management
  const setActiveLayer = (id: string) => setActiveLayerId(id);

  const toggleLayerVisibility = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const addLayer = () => {
    const newLayer: Layer = {
      id: uuidv4(),
      name: `图层 ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: '正常'
    };
    setLayers([newLayer, ...layers]);
    setActiveLayerId(newLayer.id);
  };

  // Duplicate layer function
  const duplicateLayer = () => {
    const activeLayer = layers.find(layer => layer.id === activeLayerId);
    if (!activeLayer) return;
    
    const newLayer: Layer = {
      id: uuidv4(),
      name: `${activeLayer.name} 副本`,
      visible: activeLayer.visible,
      locked: activeLayer.locked,
      opacity: activeLayer.opacity,
      blendMode: activeLayer.blendMode
    };
    
    const currentLayerId = newLayer.id;
    
    setLayers(prev => [newLayer, ...prev]);
    setElements(prev => [
      ...prev,
      ...prev
        .filter(element => element.layerId === activeLayerId)
        .map(element => ({
          ...element,
          id: uuidv4(),
          layerId: currentLayerId
        }))
    ]);
    setActiveLayerId(currentLayerId);
  };

  // Remove layer function
  const removeLayer = (id: string) => {
    if (layers.length <= 1) return; // Keep at least one layer
    
    // Remove elements from the layer being removed
    setElements(prevElements => prevElements.filter(element => element.layerId !== id));
    
    // Update layers
    setLayers(layers.filter(l => l.id !== id));
    
    // Update active layer if needed
    if (activeLayerId === id) setActiveLayerId(layers[0].id);
  };

  // Move layer up or down
  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const layerIndex = layers.findIndex(l => l.id === id);
    if (layerIndex === -1) return;

    const newLayers = [...layers];
    if (direction === 'up' && layerIndex > 0) {
      // Move up
      [newLayers[layerIndex], newLayers[layerIndex - 1]] = [newLayers[layerIndex - 1], newLayers[layerIndex]];
    } else if (direction === 'down' && layerIndex < newLayers.length - 1) {
      // Move down
      [newLayers[layerIndex], newLayers[layerIndex + 1]] = [newLayers[layerIndex + 1], newLayers[layerIndex]];
    }

    setLayers(newLayers);
  };

  const clearCanvas = () => {
    const snapshot: UndoSnapshot = { elements, layers, frames };
    setUndoStack(prev => {
      const newStack = [...prev, snapshot];
      if (newStack.length > 50) {
        return newStack.slice(newStack.length - 50);
      }
      return newStack;
    });
    setRedoStack([]);
    setElements([]);
    setLayers(INITIAL_LAYERS);
    setActiveLayerId(INITIAL_LAYERS[0]?.id || '');
  };

  const saveToUndoStack = (currentElements: ExcalidrawElement[], currentLayers: Layer[], currentFrames: AppState['frames']) => {
    const snapshot: UndoSnapshot = { elements: currentElements, layers: currentLayers, frames: currentFrames };
    setUndoStack(prev => {
      const newStack = [...prev, snapshot];
      if (newStack.length > 50) {
        return newStack.slice(newStack.length - 50);
      }
      return newStack;
    });
    setRedoStack([]);
  };

  const addElement = (element: ExcalidrawElement) => {
    saveToUndoStack(elements, layers, frames);
    setElements(prev => [...prev, element]);
  };

  const updateElement = (elementId: string, updates: Partial<ExcalidrawElement>) => {
    saveToUndoStack(elements, layers, frames);
    setElements(prev => 
      prev.map(element => element.id === elementId ? { ...element, ...updates } : element)
    );
  };

  const deleteElement = (elementId: string) => {
    saveToUndoStack(elements, layers, frames);
    setElements(prev => prev.filter(element => element.id !== elementId));
  };

  const addElements = (newElements: ExcalidrawElement[]) => {
    saveToUndoStack(elements, layers, frames);
    setElements(prev => [...prev, ...newElements]);
  };

  const updateElements = (updates: Array<{ elementId: string; updates: Partial<ExcalidrawElement> }>) => {
    saveToUndoStack(elements, layers, frames);
    const updateMap = new Map(updates.map(u => [u.elementId, u.updates]));
    setElements(prev =>
      prev.map(element => {
        const elementUpdates = updateMap.get(element.id);
        return elementUpdates ? { ...element, ...elementUpdates } : element;
      })
    );
  };

  const deleteElements = (elementIds: string[]) => {
    saveToUndoStack(elements, layers, frames);
    const idsToDelete = new Set(elementIds);
    setElements(prev => prev.filter(element => !idsToDelete.has(element.id)));
  };

  const saveSnapshot = () => {
    saveToUndoStack(elements, layers, frames);
  };

  const triggerUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    const currentSnapshot: UndoSnapshot = { elements, layers, frames };
    setRedoStack(prev => [...prev, currentSnapshot]);
    setUndoStack(newUndoStack);
    setElements(previousState.elements);
    setLayers(previousState.layers);
    setFrames(previousState.frames);
  };

  const triggerRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    const currentSnapshot: UndoSnapshot = { elements, layers, frames };
    setUndoStack(prev => [...prev, currentSnapshot]);
    setRedoStack(newRedoStack);
    setElements(nextState.elements);
    setLayers(nextState.layers);
    setFrames(nextState.frames);
  };

  const toggleOnionSkin = () => {
    setOnionSkin(prev => !prev);
  };

  // Project management functions
  const addProject = (name: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Save project to localStorage
    const projectData = {
      project: newProject,
      layers: INITIAL_LAYERS,
      elements: INITIAL_ELEMENTS,
      frames: []
    };
    localStorage.setItem(`project_${newProject.id}`, JSON.stringify(projectData));
    
    // Update projects list
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Switch to new project
    switchProject(newProject.id);
  };

  const switchProject = (projectId: string) => {
    // Save current project data if there is one
    if (currentProjectId) {
      saveProject();
    }
    
    // Load project data from localStorage
    const projectDataStr = localStorage.getItem(`project_${projectId}`);
    if (projectDataStr) {
      try {
        const projectData = JSON.parse(projectDataStr);
        setLayers(projectData.layers || INITIAL_LAYERS);
        setElements(projectData.elements || INITIAL_ELEMENTS);
        setFrames(projectData.frames || []);
        setActiveLayerId(projectData.layers?.[0]?.id || '1');
      } catch (error) {
        console.error('Failed to load project data:', error);
      }
    } else {
      // Initialize new project data
      setLayers(INITIAL_LAYERS);
      setElements(INITIAL_ELEMENTS);
      setFrames([]);
      setActiveLayerId('1');
    }
    
    setCurrentProjectId(projectId);
  };

  const saveProject = () => {
    if (!currentProjectId) return;
    
    const projectData = {
      layers,
      elements,
      frames
    };
    
    // Get existing project info
    const projectInfoStr = localStorage.getItem(`project_${currentProjectId}`);
    let projectInfo = projectInfoStr ? JSON.parse(projectInfoStr) : {};
    
    // Update project data
    const updatedProjectData = {
      ...projectInfo,
      ...projectData,
      updatedAt: Date.now()
    };
    
    localStorage.setItem(`project_${currentProjectId}`, JSON.stringify(updatedProjectData));
    
    // Update project list with new timestamp
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === currentProjectId 
          ? { ...project, updatedAt: Date.now() }
          : project
      )
    );
  };

  const loadProjects = () => {
    try {
      const projectsStr = localStorage.getItem('projects');
      if (projectsStr) {
        const loadedProjects = JSON.parse(projectsStr);
        setProjects(loadedProjects);
        
        // If there are projects, switch to the first one
        if (loadedProjects.length > 0 && !currentProjectId) {
          switchProject(loadedProjects[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const deleteProject = (projectId: string) => {
    // Remove project data from localStorage
    localStorage.removeItem(`project_${projectId}`);

    // Update projects list
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    // If deleting current project, switch to another or clear
    if (currentProjectId === projectId) {
      if (updatedProjects.length > 0) {
        switchProject(updatedProjects[0].id);
      } else {
        setCurrentProjectId(null);
        setLayers(INITIAL_LAYERS);
        setElements(INITIAL_ELEMENTS);
        setFrames([]);
        setActiveLayerId(INITIAL_LAYERS[0]?.id || '');
      }
    }
  };

  const renameProject = (projectId: string, newName: string) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId ? { ...p, name: newName, updatedAt: Date.now() } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    // Update project data
    const projectInfoStr = localStorage.getItem(`project_${projectId}`);
    if (projectInfoStr) {
      try {
        const projectInfo = JSON.parse(projectInfoStr);
        projectInfo.project = { ...projectInfo.project, name: newName, updatedAt: Date.now() };
        localStorage.setItem(`project_${projectId}`, JSON.stringify(projectInfo));
      } catch {}
    }
  };

  const duplicateProject = (projectId: string) => {
    const sourceProject = projects.find(p => p.id === projectId);
    if (!sourceProject) return;

    const sourceDataStr = localStorage.getItem(`project_${projectId}`);
    if (!sourceDataStr) return;

    const newProject: Project = {
      id: uuidv4(),
      name: `${sourceProject.name} 副本`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      const sourceData = JSON.parse(sourceDataStr);
      const newProjectData = {
        ...sourceData,
        project: newProject,
      };
      localStorage.setItem(`project_${newProject.id}`, JSON.stringify(newProjectData));
    } catch {
      return;
    }

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const exportProject = (projectId: string): string | null => {
    const projectInfoStr = localStorage.getItem(`project_${projectId}`);
    if (!projectInfoStr) return null;

    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    try {
      const projectData = JSON.parse(projectInfoStr);
      const exportData = {
        version: 1,
        project: {
          name: project.name,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        layers: projectData.layers || [],
        elements: projectData.elements || [],
        frames: projectData.frames || [],
      };
      return JSON.stringify(exportData, null, 2);
    } catch {
      return null;
    }
  };

  const importProject = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.project || !data.project.name) return false;

      const newProject: Project = {
        id: uuidv4(),
        name: data.project.name,
        createdAt: data.project.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      const projectData = {
        project: newProject,
        layers: data.layers || INITIAL_LAYERS,
        elements: data.elements || INITIAL_ELEMENTS,
        frames: data.frames || [],
      };

      localStorage.setItem(`project_${newProject.id}`, JSON.stringify(projectData));

      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));

      switchProject(newProject.id);
      return true;
    } catch {
      return false;
    }
  };

  // Current project name
  const currentProjectName = projects.find(p => p.id === currentProjectId)?.name || '未命名作品';

  const appState: AppState = {
    currentTool,
    activePanel,
    activeLayerId,
    brushColor,
    brushSize: currentToolSettings.brushSize,
    brushOpacity: currentToolSettings.brushOpacity,
    canvasScale,
    canvasRotation,
    layers,
    elements,
    activeElement,
    isDrawing,
    roughness,
    strokeSharpness,
    undoTrigger: undoStack.length,
    redoTrigger: redoStack.length,
    animation,
    frames,
    projects,
    currentProjectId
  };

  return (
    <StoreContext.Provider value={{
      ...appState,
      setTool,
      togglePanel,
      setActiveLayer,
      setLayers,
      setElements,
      setFrames,
      setActiveLayerId,
      toggleLayerVisibility,
      updateLayer,
      addLayer,
      duplicateLayer,
      removeLayer,
      moveLayer,
      setColor: setBrushColor,
      setBackgroundColor,
      setFillColor,
      setBrushSize: (size: number) => updateCurrentToolSetting('brushSize', size),
      setBrushOpacity: (opacity: number) => updateCurrentToolSetting('brushOpacity', opacity),
      setRoughness,
      setStrokeSharpness,
      setFillStyle,
      setStrokeStyle,
      setCornerRadius,
      setCanvasScale,
      addElement,
      updateElement,
      deleteElement,
      addElements,
      updateElements,
      deleteElements,
      saveSnapshot,
      setActiveElement,
      setIsDrawing,
      clearCanvas,
      brushes: INITIAL_BRUSHES,
      activeBrushId,
      triggerUndo,
      triggerRedo,
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      fillStyle,
      backgroundColor,
      fillColor,
      bucketFillColor,
      setBucketFillColor,
      strokeStyle,
      cornerRadius,
      toolSettings,
      // Animation settings
      animationFps,
      setAnimationFps,
      onionSkin,
      toggleOnionSkin,
      animation,
      frames,
      setAnimation: updateAnimation,
      // Project management functions
      addProject,
      switchProject,
      saveProject,
      loadProjects,
      deleteProject,
      renameProject,
      duplicateProject,
      exportProject,
      importProject,
      currentProjectName
    }}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook for accessing store
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
