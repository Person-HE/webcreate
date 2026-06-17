import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../../store';
import { renderScene, renderElement, renderSelectionBorders } from '../../utils/renderScene';
import { ExcalidrawElement, FreeDrawElement, ResizeHandle } from '../../types';
import { 
  getElementBounds, 
  resizeElement, 
  isPointOnResizeHandle
} from '../../utils/elementTransformers';
import { generateTweenFrame, generateTrailFrames, computeElementDisplacement } from '../../utils/tweenAnimation';
import { getEasingValue, easeInOutCubic, MotionTrailConfig, DEFAULT_TRAIL_CONFIG, AnimationEasingConfig } from '../../utils/physicsAnimation';
import { v4 as uuidv4 } from 'uuid';

const CanvasBoard = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Single canvas architecture
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Store state
  const {
    brushColor,
    brushSize,
    brushOpacity,
    roughness,
    currentTool,
    canvasScale,
    setCanvasScale,
    activeElement,
    isDrawing,
    setIsDrawing,
    setActiveElement,
    addElement,
    updateElement,
    deleteElement,
    addElements,
    updateElements,
    deleteElements,
    saveSnapshot,
    setElements,
    layers,
    setLayers,
    frames,
    setFrames,
    activeLayerId,
    setActiveLayerId,
    setColor,
    setBackgroundColor,
    backgroundColor,
    fillColor,
    setFillColor,
    bucketFillColor,
    fillStyle,
    setFillStyle,
    strokeStyle,
    cornerRadius,
    elements,
    onionSkin,
    strokeSharpness,
    addLayer,
    setActiveLayer,
    projects,
    currentProjectId,
    addProject,
    switchProject,
    saveProject,
    loadProjects,
    animationFps,
    animation
  } = useStore();
  
  // Selection state
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [moveOffset, setMoveOffset] = useState({ x: 0, y: 0 });
  
  // Rotation state
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStartAngle, setRotationStartAngle] = useState(0);
  
  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartElement, setResizeStartElement] = useState<ExcalidrawElement | null>(null);
  
  // Drawing state
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [eraserPosition, setEraserPosition] = useState({ x: -100, y: -100 });
  
  // Canvas pan/zoom state
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffsetStart, setPanOffsetStart] = useState({ x: 0, y: 0 });
  const spacePressedRef = useRef(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  // Animation modal state
  const [isAnimationModalOpen, setIsAnimationModalOpen] = useState(false);
  const [animationIsPlaying, setAnimationIsPlaying] = useState(false);
  const [currentAnimationFrame, setCurrentAnimationFrame] = useState(0);
  const animationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationIsPlayingRef = useRef(false);
  const lastFrameTimeRef = useRef<number>(0);
  
  // JSON input state
  const [isJsonInputOpen, setIsJsonInputOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  
  // Export video state
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  
  // Project management state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // State for text editing
  const [newProjectName, setNewProjectName] = useState('');
  const [projectNameError, setProjectNameError] = useState(false);
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);
  
  // Text tool state
  const [editingElement, setEditingElement] = useState<ExcalidrawElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Move undo tracking
  const moveStartElementsRef = useRef<ExcalidrawElement[] | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Save project ref to avoid effect dependency issues
  const saveProjectRef = useRef(saveProject);
  saveProjectRef.current = saveProject;
  
  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);
  
  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  // Click outside to close project list
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isProjectListOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.project-list-container')) {
          setIsProjectListOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProjectListOpen]);
  
  // Save project when elements change
  useEffect(() => {
    if (currentProjectId) {
      saveProjectRef.current();
    }
  }, [elements, layers, frames, currentProjectId]);
  
  // Initialize canvas and handle resize (merged from 3 separate effects)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let resizeTimeout: NodeJS.Timeout;
    let lastWidth = 0;
    let lastHeight = 0;
    
    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      
      if (width !== lastWidth || height !== lastHeight) {
        lastWidth = width;
        lastHeight = height;
        
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        contextRef.current = ctx;
        ctx.fillStyle = backgroundColor || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvasOffset.x, canvasOffset.y);
        ctx.scale(canvasScale, canvasScale);
        renderScene(ctx, elements, activeLayerId, layers, 0.3, backgroundColor);
        ctx.restore();
      }
    };
    
    updateCanvasSize();
    
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [backgroundColor, elements, activeLayerId, layers, canvasOffset, canvasScale]);
  
  // Render scene and active element in a single canvas
  useEffect(() => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    
    // Force clear and fill background first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply canvas offset and scale transforms
    ctx.save();
    ctx.translate(canvasOffset.x, canvasOffset.y);
    ctx.scale(canvasScale, canvasScale);
    
    // Use new renderScene function with onion skin effect
    renderScene(
      ctx,
      elements,
      activeLayerId,
      layers,
      0.3,
      backgroundColor
    );
    
    // Render selected elements highlight
    if (selectedElements.length > 0) {
      renderSelectionBorders(ctx, elements, selectedElements);
    }
    
    // Render selection rectangle
    if (isSelecting) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1 / canvasScale;
      ctx.setLineDash([5 / canvasScale, 5 / canvasScale]);
      ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height);
      ctx.setLineDash([]);
    }
    
    // Render the active element (currently drawing)
    if (activeElement) {
      renderElement(ctx, activeElement);
    }
    
    ctx.restore();
  }, [elements, onionSkin, activeElement, selectedElements, isSelecting, selectionRect, layers, activeLayerId, backgroundColor, canvasOffset, canvasScale]);
  

  
  // Get coordinates relative to canvas with proper scaling
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    // Get mouse position from event
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Get canvas position and size relative to viewport
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scale factors - actual canvas size vs displayed size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Calculate mouse position relative to canvas and apply scale
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    
    // Account for canvas offset and scale to get world coordinates
    const x = (canvasX - canvasOffset.x) / canvasScale;
    const y = (canvasY - canvasOffset.y) / canvasScale;
    
    return { x, y };
  };
  
  // Create a new element based on current tool
  const createNewElement = (type: ExcalidrawElement['type'], x: number, y: number) => {
    const baseElement: ExcalidrawElement = {
      id: uuidv4(),
      type,
      x,
      y,
      width: 0,
      height: 0,
      angle: 0,
      strokeColor: brushColor,
      backgroundColor: 'transparent', // Default to transparent
      fillStyle: 'none', // Default to no fill
      strokeWidth: brushSize,
      strokeStyle,
      roughness,
      seed: Math.random() * 1000000,
      visible: true,
      locked: false,
      opacity: brushOpacity, // Use brushOpacity from store
      cornerRadius,
      layerId: activeLayerId, // Add layerId property with current active layer
      strokeSharpness // Add strokeSharpness property
    };
    
    if (type === 'free_draw') {
      return {
        ...baseElement,
        type: 'free_draw',
        points: [[x, y, 1]] // Initial point with max pressure
      } as FreeDrawElement;
    }
    
    // For shape tools (rectangle, ellipse, diamond), use fillColor
    if (type === 'rectangle' || type === 'ellipse' || type === 'diamond') {
      return {
        ...baseElement,
        backgroundColor: fillColor,
        fillStyle: fillStyle
      };
    }
    
    return baseElement;
  };
  
  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (editingElement) {
      handleTextComplete();
      return;
    }
    
    if (currentTool === 'hand') {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setIsPanning(true);
      setPanStart({ x: clientX, y: clientY });
      setPanOffsetStart({ x: canvasOffset.x, y: canvasOffset.y });
      return;
    }
    
    // Check for panning: middle mouse button or space+left click
    const isMiddleButton = 'button' in e && e.button === 1;
    const isSpacePan = spacePressedRef.current && 'button' in e && e.button === 0;
    if (isMiddleButton || isSpacePan) {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setIsPanning(true);
      setPanStart({ x: clientX, y: clientY });
      setPanOffsetStart({ x: canvasOffset.x, y: canvasOffset.y });
      return;
    }
    
    const { x, y } = getCoordinates(e);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsDragging(true);
    setIsDrawing(true);
    
    // Handle different tools
    if (currentTool === 'eraser') {
      startErasing(e);
      return;
    } else if (currentTool === 'selection') {
      // First check if clicking on any rotation or resize handle of any element
      // This must be checked BEFORE checking if clicking on the element itself
      for (const element of elements) {
        if (element.layerId !== activeLayerId) continue;
        
        // Check resize/rotation handles first (before element selection)
        const handle = isPointOnResizeHandle(x, y, element, 30);
        if (handle) {
          // Select the element first
          if (!selectedElements.includes(element.id)) {
            setSelectedElements([element.id]);
          }
          
          if (handle === 'rotation') {
            setIsRotating(true);
            const elementCenterX = element.x + element.width / 2;
            const elementCenterY = element.y + element.height / 2;
            const startAngle = Math.atan2(y - elementCenterY, x - elementCenterX);
            setRotationStartAngle(startAngle - (element.angle * Math.PI / 180));
            return;
          } else {
            setIsResizing(true);
            setResizeHandle(handle);
            setResizeStartPos({ x, y });
            setResizeStartElement(element);
            return;
          }
        }
      }
      
      // Then check if clicking on any element body
      const clickedElement = elements.find(element => {
        if (element.layerId !== activeLayerId) return false;
        
        if (element.type === 'free_draw') {
          const freeDrawElement = element as FreeDrawElement;
          if (freeDrawElement.points.length < 2) return false;
          
          const canvas = canvasRef.current;
          if (!canvas) return false;
          const ctx = canvas.getContext('2d');
          if (!ctx) return false;
          
          ctx.beginPath();
          ctx.moveTo(freeDrawElement.points[0][0], freeDrawElement.points[0][1]);
          for (let i = 1; i < freeDrawElement.points.length; i++) {
            ctx.lineTo(freeDrawElement.points[i][0], freeDrawElement.points[i][1]);
          }
          ctx.closePath();
          
          return ctx.isPointInPath(x, y, 'nonzero') || 
                 ctx.isPointInStroke(x, y);
        } else if (element.type === 'text') {
          // For text elements, check if mouse is inside bounding box
          return x >= element.x && x <= element.x + element.width &&
                 y >= element.y && y <= element.y + element.height;
        } else {
          // Increased click area for easier selection
          const clickAreaPadding = 10;
          return x >= element.x - clickAreaPadding && x <= element.x + element.width + clickAreaPadding &&
                 y >= element.y - clickAreaPadding && y <= element.y + element.height + clickAreaPadding;
        }
      });
      
      if (clickedElement) {
        if (!selectedElements.includes(clickedElement.id)) {
          setSelectedElements([clickedElement.id]);
        }
        
        setIsMoving(true);
        setMoveOffset({ x: 0, y: 0 });
        saveSnapshot();
        moveStartElementsRef.current = [...elements];
        return;
      } else {
        setSelectedElements([]);
        setIsSelecting(true);
        setSelectionRect({ x, y, width: 0, height: 0 });
        return;
      }
    } else if (currentTool === 'fill') {
      const elementsUnderCursor = elements.filter(element => {
        if (element.layerId !== activeLayerId) return false;
        
        if (element.type === 'free_draw') {
          const freeDrawElement = element as FreeDrawElement;
          if (freeDrawElement.points.length < 2) return false;
          
          const canvas = canvasRef.current;
          if (!canvas) return false;
          const ctx = canvas.getContext('2d');
          if (!ctx) return false;
          
          ctx.beginPath();
          ctx.moveTo(freeDrawElement.points[0][0], freeDrawElement.points[0][1]);
          for (let i = 1; i < freeDrawElement.points.length; i++) {
            ctx.lineTo(freeDrawElement.points[i][0], freeDrawElement.points[i][1]);
          }
          ctx.closePath();
          
          return ctx.isPointInPath(x, y, 'nonzero');
        } else {
          return x >= element.x && x <= element.x + element.width &&
                 y >= element.y && y <= element.y + element.height;
        }
      });
      
      if (elementsUnderCursor.length > 0) {
        updateElements(elementsUnderCursor.map(element => ({
          elementId: element.id,
          updates: { backgroundColor: bucketFillColor, fillStyle: 'solid' }
        })));
      }
      
      setIsDragging(false);
      setIsDrawing(false);
      return;
    } else if (currentTool === 'text') {
      // Handle text tool - create text element with HTML overlay
      const id = uuidv4();
      const newTextElement: ExcalidrawElement = {
        id,
        type: 'text',
        x, y,
        width: 10, height: 10, // 初始极小，随内容撑开
        angle: 0,
        text: '', // 初始为空
        fontSize: 24,
        fontFamily: 'Virgil, "Segoe UI Emoji"', // 手绘字体栈
        strokeColor: brushColor,
        backgroundColor: 'transparent',
        fillStyle: 'none',
        strokeWidth: 1,
        strokeStyle: 'solid',
        roughness: 1,
        seed: Math.random() * 1000000,
        visible: true,
        locked: false,
        opacity: 100,
        cornerRadius: 0,
        layerId: activeLayerId,
        strokeSharpness: 'round',
        textAlign: 'left'
      };
      
      // 立即设置为正在编辑，此时不添加到 elements 数组
      setEditingElement(newTextElement);
      
      // 聚焦输入框 (使用 setTimeout 确保 DOM 渲染后聚焦)
      setTimeout(() => textAreaRef.current?.focus(), 0);
      
      // Reset drawing state
      setIsDragging(false);
      setIsDrawing(false);
      return;
    } else if (currentTool === 'image') {
      // Handle image tool - open file input for image upload
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
              // 限制最大初始尺寸，防止图片过大
              let width = img.naturalWidth;
              let height = img.naturalHeight;
              const MAX_SIZE = 500;
              if (width > MAX_SIZE || height > MAX_SIZE) {
                const ratio = width / height;
                if (width > height) { width = MAX_SIZE; height = MAX_SIZE / ratio; }
                else { height = MAX_SIZE; width = MAX_SIZE * ratio; }
              }
              
              addElement({
                id: uuidv4(),
                type: 'image',
                x: x - width / 2, // 居中放置
                y: y - height / 2,
                width, height,
                angle: 0,
                imageUrl: readerEvent.target?.result as string,
                strokeColor: 'transparent',
                backgroundColor: 'transparent',
                fillStyle: 'none',
                strokeWidth: 1,
                strokeStyle: 'solid',
                roughness: 1,
                seed: Math.random() * 1000000,
                visible: true,
                locked: false,
                opacity: 100,
                cornerRadius: 0,
                layerId: activeLayerId,
                strokeSharpness: 'round'
              } as any);
            };
            img.src = readerEvent.target?.result as string;
          };
          reader.readAsDataURL(file);
        };
        input.click();
      } catch (error) {
        // Error opening file input
      }
      
      // Reset drawing state
      setIsDragging(false);
      setIsDrawing(false);
      return;
    }
    
    // Create new active element based on current tool
    let newElement: ExcalidrawElement;
    
    // For brush tool, use free_draw type
    const elementType = currentTool === 'brush' ? 'free_draw' : currentTool;
    
    newElement = {
      ...createNewElement(elementType as any, x, y),
      strokeStyle,
      cornerRadius
    };
      
    setActiveElement(newElement);
  };
  
  // Continue drawing
  const continueDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      const deltaX = clientX - panStart.x;
      const deltaY = clientY - panStart.y;
      setCanvasOffset({
        x: panOffsetStart.x + deltaX,
        y: panOffsetStart.y + deltaY
      });
      return;
    }
    
    if (!isDragging || !isDrawing) return;
    
    e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    setCurrentPos({ x, y });
    
    // Handle selection tool
    if (currentTool === 'selection') {
      if (isMoving) {
        const deltaX = x - startPos.x;
        const deltaY = y - startPos.y;
        setMoveOffset({ x: deltaX, y: deltaY });
        
        setElements(prev => prev.map(el => {
          if (!selectedElements.includes(el.id)) return el;
          if (el.type === 'free_draw') {
            const freeDrawEl = el as FreeDrawElement;
            const updatedPoints: [number, number, number][] = freeDrawEl.points.map(([px, py, pressure]) => [
              px + deltaX,
              py + deltaY,
              pressure
            ]);
            return { ...el, points: updatedPoints, x: el.x + deltaX, y: el.y + deltaY };
          }
          return { ...el, x: el.x + deltaX, y: el.y + deltaY };
        }));
        
        setStartPos({ x, y });
        return;
      } else if (isRotating) {
        // Handle rotation
        selectedElements.forEach(elementId => {
          const element = elements.find(el => el.id === elementId);
          if (element) {
            const elementCenterX = element.x + element.width / 2;
            const elementCenterY = element.y + element.height / 2;
            
            const currentAngle = Math.atan2(y - elementCenterY, x - elementCenterX);
            const newAngle = ((currentAngle - rotationStartAngle) * 180 / Math.PI) % 360;
            
            updateElement(elementId, { angle: newAngle });
          }
        });
        
        return;
      } else if (isSelecting) {
        // Handle selection rectangle
        const width = x - startPos.x;
        const height = y - startPos.y;
        setSelectionRect({
          x: width >= 0 ? startPos.x : x,
          y: height >= 0 ? startPos.y : y,
          width: Math.abs(width),
          height: Math.abs(height)
        });
        return;
      } else if (isResizing && resizeHandle && resizeStartElement) {
        // Handle resizing
        const deltaX = x - resizeStartPos.x;
        const deltaY = y - resizeStartPos.y;
        
        const updates = resizeElement(resizeStartElement, resizeHandle, deltaX, deltaY);
        updateElement(resizeStartElement.id, updates);
        return;
      }
    }
    
    if (!activeElement) return;
    
    let updatedElement: ExcalidrawElement;
    
    if (activeElement.type === 'free_draw') {
      // Update free draw points
      const freeDrawElement = activeElement as FreeDrawElement;
      const updatedPoints: [number, number, number][] = [...freeDrawElement.points, [x, y, 1] as [number, number, number]];
      
      // Calculate bounding box for free draw element
      let minX = Infinity, minY = Infinity;
      let maxX = -Infinity, maxY = -Infinity;
      
      updatedPoints.forEach(([px, py]) => {
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      });
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      const updatedFreeDrawElement: FreeDrawElement = {
        ...freeDrawElement,
        points: updatedPoints,
        x: minX,
        y: minY,
        width: width,
        height: height
      };
      updatedElement = updatedFreeDrawElement;
    } else {
      // Calculate dimensions for geometric shapes
      const width = x - startPos.x;
      const height = y - startPos.y;
      
      // For line and arrow elements, keep original start position and use actual width/height
      if (activeElement.type === 'line' || activeElement.type === 'arrow') {
        updatedElement = {
          ...activeElement,
          width,
          height,
          x: startPos.x,
          y: startPos.y
        };
      } else {
        // For other shapes, use absolute dimensions and adjust position to top-left
        updatedElement = {
          ...activeElement,
          width: Math.abs(width),
          height: Math.abs(height),
          x: width >= 0 ? startPos.x : x,
          y: height >= 0 ? startPos.y : y
        };
      }
    }
    
    setActiveElement(updatedElement);
  };
  
  // Start erasing
  const startErasing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    setEraserPosition({ x, y });
    setIsDragging(true);
    setIsDrawing(true);
  };
  
  // Continue erasing
  const continueErasing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !isDrawing) return;
    
    e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    setEraserPosition({ x, y });
    const eraserRadius = brushSize * 2;
    
    // Simple eraser logic: check if any element in current active layer is under the mouse position
    const elementsToRemove = elements.filter(element => {
      // Only erase elements in current active layer
      if (element.layerId !== activeLayerId) {
        return false;
      }
      
      // Check if mouse is near the element
      if (element.type === 'free_draw') {
        // For free draw, check if any point is within eraser radius
        const freeDrawElement = element as FreeDrawElement;
        return freeDrawElement.points.some(([px, py]) => {
          const dx = px - x;
          const dy = py - y;
          return Math.sqrt(dx * dx + dy * dy) <= eraserRadius;
        });
      } else if (element.type === 'line' || element.type === 'arrow') {
        // For line and arrow elements, check if mouse is near the line
        const startX = element.x;
        const startY = element.y;
        const endX = element.x + element.width;
        const endY = element.y + element.height;
        
        // Calculate distance from point to line
        const distance = pointToLineDistance(x, y, startX, startY, endX, endY);
        return distance <= eraserRadius;
      } else {
        // For other shapes, check if mouse is inside bounding box
        return x >= element.x - eraserRadius && 
               x <= element.x + element.width + eraserRadius &&
               y >= element.y - eraserRadius && 
               y <= element.y + element.height + eraserRadius;
      }
    });
    
    if (elementsToRemove.length > 0) {
      deleteElements(elementsToRemove.map(el => el.id));
    }
  };
  
  // Calculate distance from point (x,y) to line segment (x1,y1)-(x2,y2)
  const pointToLineDistance = (x: number, y: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Handle text input completion (Blur or Enter)
  const handleTextComplete = () => {
    if (!editingElement || !textAreaRef.current) return;
    
    const text = textAreaRef.current.value;
    if (text.trim()) {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) { setEditingElement(null); return; }
      ctx.font = `${editingElement.fontSize}px ${editingElement.fontFamily}`;
      const metrics = ctx.measureText(text);
      const width = metrics.width;
      const height = editingElement.fontSize! * 1.2;

      if (elements.find(el => el.id === editingElement.id)) {
        updateElement(editingElement.id, { text, width, height });
      } else {
        addElement({ ...editingElement, text, width, height });
      }
    }
    setEditingElement(null);
  };

  // Handle double click on canvas
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    
    // Find text element under the mouse cursor
    const textElement = elements.find(element => {
      if (element.type !== 'text') return false;
      return x >= element.x && x <= element.x + element.width &&
             y >= element.y && y <= element.y + element.height;
    });
    
    if (textElement) {
      // Enter text editing mode
      setEditingElement(textElement);
      setTimeout(() => textAreaRef.current?.select(), 0); // 选中所有文本方便修改
    }
  };
  
  // Stop drawing
  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
      if (currentTool === 'hand') return;
      return;
    }
    
    if (!isDragging || !isDrawing) return;
    
    setIsDragging(false);
    setIsDrawing(false);
    
    // Handle selection tool
    if (currentTool === 'selection') {
      if (isMoving) {
        setIsMoving(false);
        setMoveOffset({ x: 0, y: 0 });
        moveStartElementsRef.current = null;
        return;
      } else if (isRotating) {
        // Stop rotating elements
        setIsRotating(false);
        setRotationStartAngle(0);
        return;
      } else if (isSelecting) {
        setIsSelecting(false);
        
        // Find elements inside selection rectangle, only in current active layer
        const elementsInside = elements.filter(element => {
          // Check if element is in current active layer
          if (element.layerId !== activeLayerId) return false;
          
          // For free_draw elements, check if any point is inside selection rectangle
          if (element.type === 'free_draw') {
            const freeDrawElement = element as FreeDrawElement;
            return freeDrawElement.points.some(([px, py]) => {
              return px >= selectionRect.x && 
                     px <= selectionRect.x + selectionRect.width &&
                     py >= selectionRect.y &&
                     py <= selectionRect.y + selectionRect.height;
            });
          } else {
            // For other elements, check if bounding box is inside selection rectangle
            return element.x >= selectionRect.x && 
                   element.x + element.width <= selectionRect.x + selectionRect.width &&
                   element.y >= selectionRect.y &&
                   element.y + element.height <= selectionRect.y + selectionRect.height;
          }
        });
        
        // Update selected elements
        setSelectedElements(elementsInside.map(element => element.id));
        return;
      } else if (isResizing) {
        // Stop resizing
        setIsResizing(false);
        setResizeHandle(null);
        setResizeStartElement(null);
        return;
      }
    }
    
    if (!activeElement) return;
    
    // Add the active element to the current frame
    addElement(activeElement);
    
    // Clear active element and interactive canvas
    setActiveElement(null);
  };
  
  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        spacePressedRef.current = true;
        setIsSpacePressed(true);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setCanvasScale(Math.min(5, canvasScale + 0.1));
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setCanvasScale(Math.max(0.1, canvasScale - 0.1));
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setCanvasScale(1);
        setCanvasOffset({ x: 0, y: 0 });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        setCanvasScale(1);
        setCanvasOffset({ x: 0, y: 0 });
        return;
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedElements.length > 0) {
        deleteElements(selectedElements);
        setSelectedElements([]);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressedRef.current = false;
        setIsSpacePressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedElements, deleteElements, canvasScale, setCanvasScale]);

  // Ctrl+Wheel zoom support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(5, Math.max(0.1, canvasScale + delta));
        setCanvasScale(newScale);
      }
    };
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [canvasScale, setCanvasScale]);
  
  // Play animation loop
  const playAnimation = () => {
    animationIsPlayingRef.current = true;
    setAnimationIsPlaying(true);
  };
  
  const stopAnimation = () => {
    animationIsPlayingRef.current = false;
    setAnimationIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const visibleFrames = getLayerFrames().filter(f => f.visible);
    if (visibleFrames.length > 0) {
      setCurrentAnimationFrame(visibleFrames.length - 1);
    }
  };
  
  // Reset animation to first frame
  const resetAnimation = () => {
    stopAnimation();
    setCurrentAnimationFrame(0);
  };
  
  // Open preview modal
  const openPreviewModal = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    animationIsPlayingRef.current = false;
    setAnimationIsPlaying(false);
    setCurrentAnimationFrame(0);
    setIsAnimationModalOpen(true);
    requestAnimationFrame(() => {
      animationIsPlayingRef.current = true;
      setAnimationIsPlaying(true);
    });
  };
  
  // Export animation as video
  const exportVideo = async () => {
    const visibleFrames = getLayerFrames().filter(f => f.visible);
    if (visibleFrames.length === 0) {
      setNotification({ text: '没有可见帧可用于导出视频', type: 'error' });
      return;
    }
    
    setIsExportingVideo(true);
    
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1920;
      tempCanvas.height = 1080;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        throw new Error('无法创建临时画布');
      }
      
      const fps = animationFps || animation.fps || 12;
      const totalDuration = visibleFrames.length * (1000 / fps);
      const videoFps = 60;
      const totalVideoFrames = Math.ceil(totalDuration / 1000 * videoFps);
      const frameDuration = 1000 / fps;
      
      const stream = tempCanvas.captureStream(videoFps);
      
      let recorderOptions: MediaRecorderOptions = {
        mimeType: 'video/mp4',
        videoBitsPerSecond: 10000000
      };
      
      if (!MediaRecorder.isTypeSupported('video/mp4')) {
        recorderOptions = {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 10000000
        };
      }
      
      const recorder = new MediaRecorder(stream, recorderOptions);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        if (chunks.length === 0) {
          setIsExportingVideo(false);
          setNotification({ text: '视频导出失败，没有录制到内容！', type: 'error' });
          return;
        }
        
        const fileExtension = recorderOptions.mimeType!.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: recorderOptions.mimeType });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `animation-${Date.now()}.${fileExtension}`;
        link.click();
        URL.revokeObjectURL(url);
        setIsExportingVideo(false);
        setNotification({ text: '视频导出成功！', type: 'success' });
      };
      
      recorder.onerror = () => {
        setIsExportingVideo(false);
        setNotification({ text: '视频导出失败，请重试！', type: 'error' });
      };
      
      recorder.start(100);
      
      const trailConfig: MotionTrailConfig = {
        enabled: true,
        trailCount: 3,
        trailDecay: 0.5,
        speedThreshold: 30,
      };

      const defaultEasingConfig: AnimationEasingConfig = {
        position: 'easeInOutCubic',
        scale: 'easeOutBack',
        rotation: 'easeInOutCubic',
        opacity: 'easeInOutSine',
        path: 'easeInOutCubic',
      };
      
      const framesToRender = visibleFrames;
      const loopCount = 2;
      const totalAnimFrames = framesToRender.length * loopCount;
      
      for (let videoFrame = 0; videoFrame < totalVideoFrames * loopCount; videoFrame++) {
        const elapsed = (videoFrame / videoFps) * 1000;
        
        const keyframeIndex = Math.floor(elapsed / frameDuration) % framesToRender.length;
        const keyframeProgress = (elapsed % frameDuration) / frameDuration;
        const easedProgress = getEasingValue('easeInOutCubic', keyframeProgress);
        
        const frameA = framesToRender[keyframeIndex];
        const frameB = framesToRender[(keyframeIndex + 1) % framesToRender.length];

        const displacement = computeElementDisplacement(frameA.elements, frameB.elements);
        const maxDisplacement = Math.max(0, ...Array.from(displacement.values()));
        const showTrails = trailConfig.enabled && maxDisplacement > trailConfig.speedThreshold;
        
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.save();

        if (showTrails && easedProgress > 0.05 && easedProgress < 0.95) {
          const trailFrames = generateTrailFrames(frameA.elements, frameB.elements, trailConfig);
          for (let ti = trailFrames.length - 1; ti >= 0; ti--) {
            const trail = trailFrames[ti];
            trail.elements.forEach(element => {
              tempCtx.save();
              tempCtx.globalAlpha = ((element.opacity || 100) / 100) * trail.alpha * 0.4;
              renderElement(tempCtx, element);
              tempCtx.restore();
            });
          }
        }

        if (easedProgress < 0.05) {
          frameA.elements.forEach(element => {
            tempCtx.save();
            tempCtx.globalAlpha = (element.opacity || 100) / 100;
            renderElement(tempCtx, element);
            tempCtx.restore();
          });
        } else if (easedProgress > 0.95) {
          frameB.elements.forEach(element => {
            tempCtx.save();
            tempCtx.globalAlpha = (element.opacity || 100) / 100;
            renderElement(tempCtx, element);
            tempCtx.restore();
          });
        } else {
          const interpolated = generateTweenFrame(frameA.elements, frameB.elements, easedProgress, defaultEasingConfig);
          if (interpolated.length > 0) {
            interpolated.forEach(element => {
              tempCtx.save();
              tempCtx.globalAlpha = (element.opacity || 100) / 100;
              renderElement(tempCtx, element);
              tempCtx.restore();
            });
          } else {
            const fadeOutAlpha = 1 - easedProgress;
            const fadeInAlpha = easedProgress;
            if (fadeOutAlpha > 0.01) {
              frameA.elements.forEach(element => {
                tempCtx.save();
                tempCtx.globalAlpha = ((element.opacity || 100) / 100) * fadeOutAlpha;
                renderElement(tempCtx, element);
                tempCtx.restore();
              });
            }
            if (fadeInAlpha > 0.01) {
              frameB.elements.forEach(element => {
                tempCtx.save();
                tempCtx.globalAlpha = ((element.opacity || 100) / 100) * fadeInAlpha;
                renderElement(tempCtx, element);
                tempCtx.restore();
              });
            }
          }
        }
        
        tempCtx.restore();
        
        await new Promise(resolve => setTimeout(resolve, 1000 / videoFps));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      recorder.stop();
    } catch (error) {
      setIsExportingVideo(false);
      setNotification({ text: '视频导出失败，请重试！', type: 'error' });
    }
  };
  
  // 导出当前活动图层为图片
  const exportImage = () => {
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer) {
      setNotification({ text: '请先选择要导出的图层', type: 'error' });
      return;
    }
    
    const layerElements = elements.filter(el => el.layerId === activeLayerId && el.visible);
    if (layerElements.length === 0) {
      setNotification({ text: '当前图层没有可见元素', type: 'error' });
      return;
    }
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1920;
    tempCanvas.height = 1080;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      setNotification({ text: '导出失败', type: 'error' });
      return;
    }
    
    renderScene(tempCtx, layerElements, activeLayerId, layers, 0, '#ffffff');
    
    const link = document.createElement('a');
    link.download = `${activeLayer.name}-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
    
    setNotification({ text: `图层"${activeLayer.name}"导出成功！`, type: 'success' });
  };
  
  // 导出所有可见图层合并为图片
  const exportAllLayersImage = () => {
    const visibleLayerFrames = getLayerFrames().filter(f => f.visible);
    if (visibleLayerFrames.length === 0) {
      setNotification({ text: '没有可见图层', type: 'error' });
      return;
    }
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1920;
    tempCanvas.height = 1080;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      setNotification({ text: '导出失败', type: 'error' });
      return;
    }
    
    const allElements = visibleLayerFrames.flatMap(f => f.elements);
    if (allElements.length === 0) {
      setNotification({ text: '没有可见元素', type: 'error' });
      return;
    }
    
    renderScene(tempCtx, allElements, undefined, layers, 0, '#ffffff');
    
    const link = document.createElement('a');
    link.download = `all-layers-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
    
    setNotification({ text: '所有图层导出成功！', type: 'success' });
  };
  
  // 辅助函数：计算两点距离
  const dist = (p1: number[], p2: number[]) => {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 辅助函数：计算路径总长度
  const pathLength = (points: number[][]) => {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += dist(points[i - 1], points[i]);
    }
    return len;
  };

  // 辅助函数：重采样路径点到指定密度（每 targetSpacing 像素一个点）
  const resamplePoints = (points: number[][], targetSpacing: number = 4): number[][] => {
    if (points.length < 2) return points;

    const resampled: number[][] = [points[0]];
    let accumulated = 0;

    for (let i = 1; i < points.length; i++) {
      const segLen = dist(points[i - 1], points[i]);
      if (segLen === 0) continue;

      const dx = points[i][0] - points[i - 1][0];
      const dy = points[i][1] - points[i - 1][1];

      let walked = 0;
      while (walked + (targetSpacing - accumulated) <= segLen) {
        const step = targetSpacing - accumulated;
        walked += step;
        const ratio = walked / segLen;
        const prev = resampled[resampled.length - 1];
        // 只在距离足够时添加新点，避免重复
        const newX = points[i - 1][0] + dx * ratio;
        const newY = points[i - 1][1] + dy * ratio;
        if (dist(prev, [newX, newY]) >= targetSpacing * 0.5) {
          resampled.push([
            newX,
            newY,
            points[i][2] || 1
          ]);
        }
        accumulated = 0;
      }
      accumulated += segLen - walked;
    }

    // 保留终点
    const last = points[points.length - 1];
    if (dist(resampled[resampled.length - 1], last) > targetSpacing * 0.3) {
      resampled.push(last);
    }

    return resampled;
  };

  // 辅助函数：轻度平滑（仅在点足够密时使用，避免破坏形状）
  const smoothPointsLight = (points: number[][], iterations: number = 1): number[][] => {
    if (points.length < 5) return points;
    let result = points;
    for (let iter = 0; iter < iterations; iter++) {
      const smoothed: number[][] = [result[0]];
      for (let i = 1; i < result.length - 1; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        const next = result[i + 1];
        // 70% 保留原位置 + 30% 邻域平均，保持形状不被破坏
        smoothed.push([
          curr[0] * 0.7 + (prev[0] + next[0]) * 0.15,
          curr[1] * 0.7 + (prev[1] + next[1]) * 0.15,
          curr[2] || 1
        ]);
      }
      smoothed.push(result[result.length - 1]);
      result = smoothed;
    }
    return result;
  };

  // 主处理函数：智能优化导入的 free_draw 点
  const processImportedPoints = (points: number[][]): number[][] => {
    if (!points || points.length < 2) return points;

    // 1. 先检查是否需要重采样（点太稀疏 → 重采样；点够密 → 保留）
    let avgSpacing = 100; // 默认假设很稀疏
    if (points.length > 2) {
      avgSpacing = pathLength(points) / (points.length - 1);
    }

    let processed = points;

    // 如果平均间距 > 8px，说明点太稀疏，需要重采样
    if (avgSpacing > 8) {
      processed = resamplePoints(points, 4); // 每 4px 一个点
    }

    // 2. 轻度平滑（只平滑 1 次，保留形状）
    if (processed.length > 10) {
      processed = smoothPointsLight(processed, 1);
    }

    return processed;
  };

  // Handle JSON input
  const handleJsonInput = () => {
    if (!jsonInput.trim()) {
      setNotification({ text: '请输入JSON数据', type: 'error' });
      return;
    }
    
    try {
      const data = JSON.parse(jsonInput);
      
      if (!data.layers || !Array.isArray(data.layers) || data.layers.length === 0) {
        setNotification({ text: 'JSON格式错误：需要包含layers数组', type: 'error' });
        return;
      }
      
      let minX = Infinity, minY = Infinity;
      let maxX = -Infinity, maxY = -Infinity;
      const allNewElements: any[] = [];

      data.layers.forEach((layerData: any) => {
        if (layerData.elements && Array.isArray(layerData.elements)) {
          layerData.elements.forEach((el: any) => {
            if (el.type === 'free_draw' && el.points) {
              el.points = processImportedPoints(el.points);
              el.points.forEach((p: any) => {
                minX = Math.min(minX, p[0]);
                minY = Math.min(minY, p[1]);
                maxX = Math.max(maxX, p[0]);
                maxY = Math.max(maxY, p[1]);
              });
            } else if (typeof el.x === 'number' && typeof el.y === 'number') {
              minX = Math.min(minX, el.x);
              minY = Math.min(minY, el.y);
              maxX = Math.max(maxX, el.x + (el.width || 0));
              maxY = Math.max(maxY, el.y + (el.height || 0));
            }
            allNewElements.push(el);
          });
        }
      });

      if (allNewElements.length === 0) {
        setNotification({ text: 'JSON中没有找到有效元素', type: 'error' });
        return;
      }

      const contentCenterX = minX + (maxX - minX) / 2;
      const contentCenterY = minY + (maxY - minY) / 2;

      const container = containerRef.current;
      let canvasCenterX = 960;
      let canvasCenterY = 540;
      
      if (container) {
        const rect = container.getBoundingClientRect();
        canvasCenterX = rect.width / 2;
        canvasCenterY = rect.height / 2;
      }

      const offsetX = canvasCenterX - contentCenterX;
      const offsetY = canvasCenterY - contentCenterY;

      saveSnapshot();
      
      const newLayerIds: string[] = [];
      const allBuiltElements: ExcalidrawElement[] = [];
      
      data.layers.forEach((layerData: any, layerIndex: number) => {
        const newLayerId = uuidv4();
        newLayerIds.push(newLayerId);
        
        const newLayer = {
          id: newLayerId,
          name: layerData.name || `帧 ${layerIndex + 1}`,
          visible: layerData.visible !== false,
          locked: layerData.locked || false,
          opacity: layerData.opacity || 100,
          blendMode: '正常'
        };
        
        setLayers((prevLayers: any[]) => [newLayer, ...prevLayers]);
        
        if (layerData.elements && Array.isArray(layerData.elements)) {
          layerData.elements.forEach((elementData: any) => {
            const element: ExcalidrawElement = {
              id: uuidv4(),
              type: elementData.type || 'rectangle',
              x: (elementData.x || 0) + offsetX,
              y: (elementData.y || 0) + offsetY,
              width: elementData.width || 0,
              height: elementData.height || 0,
              angle: elementData.angle || 0,
              strokeColor: elementData.strokeColor || '#000000',
              backgroundColor: elementData.backgroundColor || 'transparent',
              fillStyle: elementData.fillStyle || 'solid',
              strokeWidth: elementData.strokeWidth || 2,
              strokeStyle: elementData.strokeStyle || 'solid',
              roughness: elementData.roughness ?? 1,
              opacity: elementData.opacity || 100,
              strokeSharpness: elementData.strokeSharpness || 'round',
              seed: Math.random(),
              visible: elementData.visible !== false,
              locked: false,
              layerId: newLayerId,
              cornerRadius: elementData.cornerRadius || 0
            };

            if (element.type === 'free_draw' && elementData.points) {
              const freeDrawElement = element as any;
              freeDrawElement.points = elementData.points.map((p: any) => [
                p[0] + offsetX,
                p[1] + offsetY,
                p[2]
              ]);
              
              let fMinX = Infinity, fMinY = Infinity, fMaxX = -Infinity, fMaxY = -Infinity;
              freeDrawElement.points.forEach((p: any) => {
                fMinX = Math.min(fMinX, p[0]);
                fMinY = Math.min(fMinY, p[1]);
                fMaxX = Math.max(fMaxX, p[0]);
                fMaxY = Math.max(fMaxY, p[1]);
              });
              freeDrawElement.x = fMinX;
              freeDrawElement.y = fMinY;
              freeDrawElement.width = fMaxX - fMinX;
              freeDrawElement.height = fMaxY - fMinY;
            }

            allBuiltElements.push(element);
          });
        }
      });
      
      if (allBuiltElements.length > 0) {
        setElements(prev => [...prev, ...allBuiltElements]);
      }
      
      if (newLayerIds.length > 0) {
        setActiveLayerId(newLayerIds[0]);
      }
      
      setNotification({ text: '导入成功！已自动居中并优化线条。', type: 'success' });
      setIsJsonInputOpen(false);
      setJsonInput('');
    } catch (e) {
      setNotification({ text: `JSON解析失败：${e instanceof Error ? e.message : '未知错误'}`, type: 'error' });
    }
  };
  


  
  const getLayerFrames = () => {
    if (layers.length === 0) return [];
    return layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      elements: elements.filter(el => el.layerId === layer.id),
    }));
  };

  const computeGlobalBoundingBox = (framesToRender: { elements: ExcalidrawElement[] }[]) => {
    let globalMinX = Infinity, globalMinY = Infinity, globalMaxX = -Infinity, globalMaxY = -Infinity;
    framesToRender.forEach(frame => {
      frame.elements.forEach(el => {
        const elRight = el.x + el.width;
        const elBottom = el.y + el.height;
        if (el.x < globalMinX) globalMinX = el.x;
        if (el.y < globalMinY) globalMinY = el.y;
        if (elRight > globalMaxX) globalMaxX = elRight;
        if (elBottom > globalMaxY) globalMaxY = elBottom;
        if (el.type === 'free_draw' && (el as any).points) {
          (el as any).points.forEach((p: [number, number, number]) => {
            if (p[0] < globalMinX) globalMinX = p[0];
            if (p[1] < globalMinY) globalMinY = p[1];
            if (p[0] > globalMaxX) globalMaxX = p[0];
            if (p[1] > globalMaxY) globalMaxY = p[1];
          });
        }
      });
    });
    if (globalMinX === Infinity) {
      globalMinX = 0; globalMinY = 0; globalMaxX = 1920; globalMaxY = 1080;
    }
    return { globalMinX, globalMinY, globalMaxX, globalMaxY };
  };

  const computeCenteringTransform = (canvasWidth: number, canvasHeight: number, bbox: { globalMinX: number; globalMinY: number; globalMaxX: number; globalMaxY: number }) => {
    const contentWidth = bbox.globalMaxX - bbox.globalMinX;
    const contentHeight = bbox.globalMaxY - bbox.globalMinY;
    const padding = 40;
    const availWidth = canvasWidth - padding * 2;
    const availHeight = canvasHeight - padding * 2;
    const scaleX = canvasWidth / 1920;
    const scaleY = canvasHeight / 1080;
    const baseScale = Math.min(scaleX, scaleY);
    const fitScale = Math.min(availWidth / contentWidth, availHeight / contentHeight);
    const finalScale = Math.min(fitScale, baseScale);
    const offsetX = (canvasWidth - contentWidth * finalScale) / 2 - bbox.globalMinX * finalScale;
    const offsetY = (canvasHeight - contentHeight * finalScale) / 2 - bbox.globalMinY * finalScale;
    return { finalScale, offsetX, offsetY };
  };

  // Animation playback loop - 60fps physics interpolation with motion trails
  useEffect(() => {
    if (!animationIsPlaying || !isAnimationModalOpen) return;

    const canvas = animationCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    animationContextRef.current = ctx;
    
    const layerFrames = getLayerFrames();
    const visibleFrames = layerFrames.filter(f => f.visible);
    if (visibleFrames.length === 0 && elements.length === 0) return;
    
    const framesToRender = visibleFrames.length > 0 ? visibleFrames : [{ elements, id: 'static', name: '静态', visible: true }];
    
    if (framesToRender.length < 2) {
      const bbox = computeGlobalBoundingBox(framesToRender);
      const { finalScale, offsetX, offsetY } = computeCenteringTransform(canvas.width, canvas.height, bbox);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(finalScale, finalScale);
      framesToRender[0].elements.forEach(element => {
        ctx.save();
        ctx.globalAlpha = (element.opacity || 100) / 100;
        renderElement(ctx, element);
        ctx.restore();
      });
      ctx.restore();
      return;
    }
    
    const bbox = computeGlobalBoundingBox(framesToRender);
    const { finalScale, offsetX, offsetY } = computeCenteringTransform(canvas.width, canvas.height, bbox);
    
    let animationId: number;
    let startTime = performance.now();
    const fps = animationFps || animation.fps || 12;
    const frameDuration = 1000 / fps;

    const trailConfig: MotionTrailConfig = {
      enabled: true,
      trailCount: 3,
      trailDecay: 0.5,
      speedThreshold: 30,
    };

    const defaultEasingConfig: AnimationEasingConfig = {
      position: 'easeInOutCubic',
      scale: 'easeOutBack',
      rotation: 'easeInOutCubic',
      opacity: 'easeInOutSine',
      path: 'easeInOutCubic',
    };
    
    const animationLoop = (now: number) => {
      if (!animationIsPlayingRef.current) return;
      
      const elapsed = now - startTime;
      
      const keyframeIndex = Math.floor(elapsed / frameDuration) % framesToRender.length;
      const keyframeProgress = (elapsed % frameDuration) / frameDuration;
      
      const easedProgress = getEasingValue('easeInOutCubic', keyframeProgress);
      
      const frameA = framesToRender[keyframeIndex];
      const frameB = framesToRender[(keyframeIndex + 1) % framesToRender.length];

      const displacement = computeElementDisplacement(frameA.elements, frameB.elements);
      const maxDisplacement = Math.max(0, ...Array.from(displacement.values()));
      const showTrails = trailConfig.enabled && maxDisplacement > trailConfig.speedThreshold;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(finalScale, finalScale);

      if (showTrails && easedProgress > 0.05 && easedProgress < 0.95) {
        const trailFrames = generateTrailFrames(frameA.elements, frameB.elements, trailConfig);
        for (let ti = trailFrames.length - 1; ti >= 0; ti--) {
          const trail = trailFrames[ti];
          trail.elements.forEach(element => {
            ctx.save();
            ctx.globalAlpha = ((element.opacity || 100) / 100) * trail.alpha * 0.4;
            renderElement(ctx, element);
            ctx.restore();
          });
        }
      }

      if (easedProgress < 0.05) {
        frameA.elements.forEach(element => {
          ctx.save();
          ctx.globalAlpha = (element.opacity || 100) / 100;
          renderElement(ctx, element);
          ctx.restore();
        });
      } else if (easedProgress > 0.95) {
        frameB.elements.forEach(element => {
          ctx.save();
          ctx.globalAlpha = (element.opacity || 100) / 100;
          renderElement(ctx, element);
          ctx.restore();
        });
      } else {
        const interpolated = generateTweenFrame(frameA.elements, frameB.elements, easedProgress, defaultEasingConfig);
        if (interpolated.length > 0) {
          interpolated.forEach(element => {
            ctx.save();
            ctx.globalAlpha = (element.opacity || 100) / 100;
            renderElement(ctx, element);
            ctx.restore();
          });
        } else {
          const fadeOutAlpha = 1 - easedProgress;
          const fadeInAlpha = easedProgress;
          if (fadeOutAlpha > 0.01) {
            frameA.elements.forEach(element => {
              ctx.save();
              ctx.globalAlpha = ((element.opacity || 100) / 100) * fadeOutAlpha;
              renderElement(ctx, element);
              ctx.restore();
            });
          }
          if (fadeInAlpha > 0.01) {
            frameB.elements.forEach(element => {
              ctx.save();
              ctx.globalAlpha = ((element.opacity || 100) / 100) * fadeInAlpha;
              renderElement(ctx, element);
              ctx.restore();
            });
          }
        }
      }
      
      ctx.restore();
      
      setCurrentAnimationFrame(keyframeIndex);
      
      animationId = requestAnimationFrame(animationLoop);
      animationFrameRef.current = animationId;
    };
    
    animationId = requestAnimationFrame(animationLoop);
    animationFrameRef.current = animationId;
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationIsPlaying, isAnimationModalOpen, layers, elements, animationFps]);
  
  // Render animation frame when currentAnimationFrame changes (for paused state)
  useEffect(() => {
    if (animationIsPlaying || !isAnimationModalOpen) return;

    const canvas = animationCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    animationContextRef.current = ctx;
    
    const layerFrames = getLayerFrames();
    const visibleFrames = layerFrames.filter(f => f.visible);
    const framesForBbox = visibleFrames.length > 0 ? visibleFrames : [{ elements, id: 'static', name: '静态', visible: true }];
    const bbox = computeGlobalBoundingBox(framesForBbox);
    const { finalScale, offsetX, offsetY } = computeCenteringTransform(canvas.width, canvas.height, bbox);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(finalScale, finalScale);
    
    if (visibleFrames.length === 0) {
      if (elements.length > 0) {
        elements.forEach(element => {
          ctx.save();
          ctx.globalAlpha = (element.opacity || 100) / 100;
          renderElement(ctx, element);
          ctx.restore();
        });
      }
      ctx.restore();
      return;
    }
    
    const currentFrame = visibleFrames[currentAnimationFrame % visibleFrames.length];
    if (!currentFrame) { ctx.restore(); return; }
    
    currentFrame.elements.forEach(element => {
      ctx.save();
      ctx.globalAlpha = (element.opacity || 100) / 100;
      renderElement(ctx, element);
      ctx.restore();
    });
    
    ctx.restore();
  }, [currentAnimationFrame, layers, elements, animationIsPlaying]);

  // Sync animation frame index with active layer
  useEffect(() => {
    if (layers.length === 0) return;
    const targetLayer = layers[animation.currentFrameIndex];
    if (targetLayer) {
      setActiveLayerId(targetLayer.id);
    }
  }, [animation.currentFrameIndex, layers]);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 bg-gray-900 relative overflow-hidden z-10"
      style={{
        backgroundImage: 'radial-gradient(#2a2a2a 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        cursor: 'crosshair',
        margin: 0,
        padding: 0,
        minHeight: '400px',
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
    >
      {/* Project management bar */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white p-2 flex items-center justify-between z-40 shadow-md">
        <div className="flex items-center space-x-4">
          {/* Project name and switcher */}
          <div className="relative project-list-container">
            <button 
              onClick={() => setIsProjectListOpen(!isProjectListOpen)}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <span>{projects.find(p => p.id === currentProjectId)?.name || '无项目'}</span>
              <span>▼</span>
            </button>
            
            {isProjectListOpen && (
              <div className="absolute top-full left-0 mt-1 bg-gray-700 rounded-lg shadow-lg w-64 max-h-80 overflow-y-auto z-[60]">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => {
                      switchProject(project.id);
                      setIsProjectListOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-600 transition-colors ${currentProjectId === project.id ? 'bg-blue-600' : ''}`}
                  >
                    {project.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setIsProjectListOpen(false);
                    setIsProjectModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-600 transition-colors border-t border-gray-600"
                >
                  + 添加新项目
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">
            {currentProjectId ? '已保存' : '未选择项目'}
          </span>
        </div>
      </div>
      
      {/* Add project modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">添加新项目</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">项目名称</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => { setNewProjectName(e.target.value); setProjectNameError(false); }}
                  placeholder="输入项目名称"
                  className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 ${projectNameError ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-blue-500'}`}
                />
                {projectNameError && <p className="text-red-400 text-sm mt-1">请输入项目名称</p>}
              </div>
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={() => {
                    setIsProjectModalOpen(false);
                    setNewProjectName('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (newProjectName.trim()) {
                      addProject(newProjectName.trim());
                      setIsProjectModalOpen(false);
                      setNewProjectName('');
                      setProjectNameError(false);
                    } else {
                      setProjectNameError(true);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Combined Canvas - directly attached to container, no scaling */}
      <canvas
        ref={canvasRef}
        className="absolute top-12 left-0 w-full h-[calc(100%-3rem)]"
        style={{ 
          margin: 0,
          padding: 0,
          display: 'block',
          zIndex: 20,
          cursor: currentTool === 'hand' ? (isPanning ? 'grabbing' : 'grab') : isPanning ? 'grabbing' : isSpacePressed ? 'grab' : 'crosshair',
          position: 'absolute',
          top: '3rem', // Below project bar
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'auto',
          backgroundColor: '#ffffff' // Set default white background in CSS
        }}
        // Add event listeners directly to canvas
        onMouseDown={startDrawing}
        onMouseMove={currentTool === 'eraser' ? continueErasing : continueDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onDoubleClick={handleCanvasDoubleClick}
        onTouchStart={startDrawing}
        onTouchMove={currentTool === 'eraser' ? continueErasing : continueDrawing}
        onTouchEnd={stopDrawing}
      />
      
      {/* Text editing overlay */}
      {editingElement && (
        <textarea
          ref={textAreaRef}
          value={editingElement.text}
          onChange={(e) => {
              // 更新 editingElement 的临时状态以便 React 重渲染输入框内容
              setEditingElement({...editingElement, text: e.target.value});
          }}
          onBlur={handleTextComplete}
          style={{
            position: 'absolute',
            left: editingElement.x * canvasScale + canvasOffset.x,
            top: editingElement.y * canvasScale + canvasOffset.y + 48,
            fontSize: editingElement.fontSize! * canvasScale,
            fontFamily: editingElement.fontFamily,
            color: editingElement.strokeColor,
            background: 'transparent',
            border: '1px dashed #ccc',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            whiteSpace: 'pre',
            zIndex: 100,
            minWidth: '50px'
          }}
        />
      )}
      
      {/* Eraser visual indicator */}
      {currentTool === 'eraser' && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${eraserPosition.x * canvasScale + canvasOffset.x - brushSize * canvasScale}px`,
            top: `${eraserPosition.y * canvasScale + canvasOffset.y - brushSize * canvasScale + 48}px`,
            width: `${brushSize * 2 * canvasScale}px`,
            height: `${brushSize * 2 * canvasScale}px`,
            border: `2px solid #ff0000`,
            borderRadius: '50%',
            opacity: 0.7,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
      
      {/* Control buttons */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2 z-50 bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-2xl p-2 shadow-2xl">
        <button
          onClick={openPreviewModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          预览动画
        </button>
        <button
          onClick={exportVideo}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        >
          导出视频
        </button>
        <button
          onClick={exportImage}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors"
        >
          导出当前图层
        </button>
        <button
          onClick={exportAllLayersImage}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition-colors"
        >
          导出全部图层
        </button>
        <button
          onClick={() => setIsJsonInputOpen(true)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg shadow-lg hover:bg-yellow-700 transition-colors"
        >
          JSON输入
        </button>
      </div>
      
      {/* Preview modal */}
      {isAnimationModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-4 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">动画预览</h2>
              <button
                onClick={() => {
                  animationIsPlayingRef.current = false;
                  setIsAnimationModalOpen(false);
                  setAnimationIsPlaying(false);
                  if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                  }
                  animationCanvasRef.current = null;
                  animationContextRef.current = null;
                }}
                className="text-white hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="relative flex justify-center items-center bg-gray-800 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              <canvas
                ref={(el) => {
                  if (el) {
                    animationCanvasRef.current = el;
                    const ctx = el.getContext('2d');
                    if (ctx) {
                      animationContextRef.current = ctx;
                    }
                  }
                }}
                className="bg-white rounded-lg"
                style={{ maxWidth: '100%', maxHeight: '60vh' }}
                width={800}
                height={450}
              />
            </div>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <button
                onClick={animationIsPlaying ? stopAnimation : playAnimation}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {animationIsPlaying ? '暂停' : '播放'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* JSON input modal */}
      {isJsonInputOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-4 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">JSON输入</h2>
              <button
                onClick={() => setIsJsonInputOpen(false)}
                className="text-white hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-96 bg-gray-800 text-white rounded-lg p-4 resize-none font-mono text-sm"
                placeholder='请输入JSON数据，格式如下：
{
  "layers": [
    {
      "id": "frame-1",
      "name": "帧 1",
      "visible": true,
      "elements": [
        {
          "id": "element-1",
          "type": "rectangle",
          "x": 0,
          "y": 0,
          "width": 100,
          "height": 100,
          "angle": 0,
          "strokeColor": "#000000",
          "backgroundColor": "#ffffff",
          "fillStyle": "solid",
          "strokeWidth": 2,
          "strokeStyle": "solid",
          "roughness": 0,
          "opacity": 100,
          "seed": 12345,
          "visible": true,
          "locked": false,
          "cornerRadius": 0,
          "layerId": "frame-1",
          "strokeSharpness": "round"
        }
      ]
    }
  ]
}'
              />
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={handleJsonInput}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                渲染
              </button>
              <button
                onClick={() => setIsJsonInputOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Exporting video indicator */}
      {isExportingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">正在导出视频...</h2>
            <p className="text-gray-400">请稍候，不要关闭此窗口</p>
          </div>
        </div>
      )}

      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white transition-opacity ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.text}
        </div>
      )}

    </div>
  );
};

export default CanvasBoard;