import rough from 'roughjs';
import { getStroke } from 'perfect-freehand';
import { ExcalidrawElement, FreeDrawElement } from '../types';

const imageCache = new Map<string, HTMLImageElement>();
const roughCanvasCache = new WeakMap<HTMLCanvasElement, ReturnType<typeof rough.canvas>>();

// Generate rough.js options based on element properties
const generateRoughOptions = (element: ExcalidrawElement, opacity: number = 1) => {
  // Return basic options without strokeStyle since rough.js might not support it directly
  return {
    seed: element.seed, // Ensure consistent rendering
    roughness: element.roughness, // Hand-drawn feel
    stroke: element.strokeColor,
    strokeWidth: element.strokeWidth,
    fill: 'transparent', // Disable rough.js fill - we handle it separately
    fillStyle: 'solid', // Set to solid to avoid any fill attempts
    fillWeight: element.strokeWidth / 2, // Hachure line width (only used if fill is enabled)
    hachureGap: element.strokeWidth * 4, // Hachure spacing (only used if fill is enabled)
    curveFitting: 1, // Curve fitting level
    bowing: element.type === 'line' || element.type === 'arrow' ? 0 : 1, // Bowing effect
    cornerRadius: element.cornerRadius, // Add corner radius for rectangles
    opacity: opacity // Apply opacity to rough.js rendering
  };
};

// Render a single element
export const renderElement = (
  ctx: CanvasRenderingContext2D,
  element: ExcalidrawElement,
  onLoadCallback?: () => void
) => {
  if (!element.visible) return;
  
  // Skip rendering if width or height is 0, but allow free draw, line, arrow, text, and image elements
  if (element.type !== 'free_draw' && element.type !== 'line' && element.type !== 'arrow' && element.type !== 'text' && element.type !== 'image' && 
      (element.width <= 0 || element.height <= 0)) return;

  ctx.save();
  
  // Apply transformations based on element properties
  if (element.type === 'free_draw' || element.type === 'image' || element.type === 'text') {
    // For free draw, image, and text: translate to element position and rotate
    ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    ctx.rotate((element.angle * Math.PI) / 180);
    ctx.translate(-(element.x + element.width / 2), -(element.y + element.height / 2));
  } else if (element.type !== 'line' && element.type !== 'arrow') {
    // For geometric shapes, center and rotate
    ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    ctx.rotate((element.angle * Math.PI) / 180);
    ctx.translate(-element.width / 2, -element.height / 2);
  } else if (element.type === 'line' || element.type === 'arrow') {
    // For line and arrow, translate to start position
    ctx.translate(element.x, element.y);
  }

  let rc = roughCanvasCache.get(ctx.canvas);
  if (!rc) {
    rc = rough.canvas(ctx.canvas);
    roughCanvasCache.set(ctx.canvas, rc);
  }
  
  // Element opacity is handled in renderScene for onion skin effect
  // Get current global alpha from context
  const currentAlpha = ctx.globalAlpha;
  
  // Draw the stroke with the appropriate style
  if (element.type === 'text') {
    // Render text element
    ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Virgil'}`;
    ctx.fillStyle = element.strokeColor;
    ctx.textAlign = element.textAlign || 'left';
    ctx.textBaseline = 'top';
    ctx.globalAlpha = currentAlpha;
    
    // Draw text at element's position
    if (element.text) {
      // 处理多行文本
      const lines = element.text?.split('\n') || [];
      const lineHeight = element.fontSize! * 1.2;
      lines.forEach((line, index) => {
        let textX = element.x;
        if (element.textAlign === 'center') {
          textX = element.x + element.width / 2;
        } else if (element.textAlign === 'right') {
          textX = element.x + element.width;
        }
        ctx.fillText(line, textX, element.y + index * lineHeight);
      });
    }
  } else if (element.type === 'image') {
    // Render image element
    ctx.globalAlpha = currentAlpha;
    
    // Draw image if imageUrl is provided
    if (element.imageUrl) {
      let img = imageCache.get(element.imageUrl);
      if (!img) {
        img = new Image();
        img.onload = () => {
          if (onLoadCallback) onLoadCallback();
        };
        img.src = element.imageUrl;
        imageCache.set(element.imageUrl, img);
      }
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, element.x, element.y, element.width, element.height);
      }
    }
  } else if (element.strokeStyle === 'solid') {
    // For solid style, use rough.js for hand-drawn effect
    const roughOptions = generateRoughOptions(element, currentAlpha);
    
    switch (element.type) {
      case 'rectangle':
        // Draw rectangle with rough.js
        rc.rectangle(0, 0, element.width, element.height, roughOptions);
        break;
        
      case 'ellipse':
        // Draw ellipse with rough.js
        rc.ellipse(element.width / 2, element.height / 2, element.width, element.height, roughOptions);
        break;
        
      case 'diamond':
        // Draw diamond with rough.js
        const centerX = element.width / 2;
        const centerY = element.height / 2;
        const diamondPoints = [
          [centerX, 0] as [number, number],
          [element.width, centerY] as [number, number],
          [centerX, element.height] as [number, number],
          [0, centerY] as [number, number]
        ];
        rc.polygon(diamondPoints as any, roughOptions);
        break;
        
      case 'line':
      case 'arrow':
        // Draw line with rough.js
        rc.line(0, 0, element.width, element.height, roughOptions);
        break;
        
      case 'free_draw':
        // Render free draw using perfect-freehand
        renderFreeDraw(ctx, element as FreeDrawElement);
        break;
    }
  } else if (element.strokeStyle === 'dashed' || element.strokeStyle === 'dotted') {
    // For dashed and dotted styles, use canvas directly
    ctx.save();
    ctx.strokeStyle = element.strokeColor;
    ctx.lineWidth = element.strokeWidth;
    ctx.globalAlpha = currentAlpha;
    
    // Set line dash pattern based on stroke style
    switch (element.strokeStyle) {
      case 'dashed':
        ctx.setLineDash([10, 5]);
        break;
      case 'dotted':
        ctx.setLineDash([2, 4]);
        break;
      default:
        ctx.setLineDash([]);
    }
    
    // Draw the path with the specified style
    ctx.beginPath();
    switch (element.type) {
      case 'rectangle':
        if (element.cornerRadius > 0) {
          // Draw rounded rectangle with proper corner radius
          const radius = Math.min(element.cornerRadius, element.width / 2, element.height / 2);
          ctx.moveTo(radius, 0);
          ctx.lineTo(element.width - radius, 0);
          ctx.quadraticCurveTo(element.width, 0, element.width, radius);
          ctx.lineTo(element.width, element.height - radius);
          ctx.quadraticCurveTo(element.width, element.height, element.width - radius, element.height);
          ctx.lineTo(radius, element.height);
          ctx.quadraticCurveTo(0, element.height, 0, element.height - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
        } else {
          // Draw rectangle
          ctx.rect(0, 0, element.width, element.height);
        }
        break;
        
      case 'ellipse':
        // Draw ellipse
        ctx.ellipse(element.width / 2, element.height / 2, element.width / 2, element.height / 2, 0, 0, Math.PI * 2);
        break;
        
      case 'diamond':
        // Draw diamond
        const centerX = element.width / 2;
        const centerY = element.height / 2;
        ctx.moveTo(centerX, 0);
        ctx.lineTo(element.width, centerY);
        ctx.lineTo(centerX, element.height);
        ctx.lineTo(0, centerY);
        ctx.closePath();
        break;
        
      case 'line':
      case 'arrow':
        // Draw line
        ctx.moveTo(0, 0);
        ctx.lineTo(element.width, element.height);
        break;
    }
    
    ctx.stroke();
    ctx.restore();
  } else if (element.type === 'free_draw') {
    // Render free draw using perfect-freehand
    renderFreeDraw(ctx, element as FreeDrawElement);
  }
  
  // Draw arrowhead for arrow elements
  if (element.type === 'arrow') {
    drawArrowhead(ctx, element.width, element.height, element.strokeColor, element.strokeWidth, currentAlpha);
  }
  
  // For all elements except text and image, draw the fill if needed (after stroke to show on top)
  if (element.fillStyle !== 'none' && element.type !== 'line' && element.type !== 'arrow' && element.type !== 'text' && element.type !== 'image') {
    // Use canvas directly for solid fill to ensure it's visible
    if (element.fillStyle === 'solid') {
      ctx.save();
      ctx.globalAlpha = currentAlpha;
      ctx.fillStyle = element.backgroundColor || '#000000';
      
      switch (element.type) {
        case 'rectangle':
          if (element.cornerRadius > 0) {
            // Draw rounded rectangle with proper corner radius
            const radius = Math.min(element.cornerRadius, element.width / 2, element.height / 2);
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(element.width - radius, 0);
            ctx.quadraticCurveTo(element.width, 0, element.width, radius);
            ctx.lineTo(element.width, element.height - radius);
            ctx.quadraticCurveTo(element.width, element.height, element.width - radius, element.height);
            ctx.lineTo(radius, element.height);
            ctx.quadraticCurveTo(0, element.height, 0, element.height - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.fill();
          } else {
            // Draw rectangle
            ctx.fillRect(0, 0, element.width, element.height);
          }
          break;
          
        case 'ellipse':
          // Draw ellipse
          ctx.beginPath();
          ctx.ellipse(element.width / 2, element.height / 2, element.width / 2, element.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'diamond':
          // Draw diamond
          ctx.beginPath();
          const centerX = element.width / 2;
          const centerY = element.height / 2;
          ctx.moveTo(centerX, 0);
          ctx.lineTo(element.width, centerY);
          ctx.lineTo(centerX, element.height);
          ctx.lineTo(0, centerY);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
    } else {
      // For hachure and cross-hatch, use rough.js
      const fillOptions = {
        seed: element.seed,
        roughness: element.roughness,
        stroke: 'transparent',
        strokeWidth: 0,
        fill: element.backgroundColor || '#000000',
        fillStyle: element.fillStyle as any,
        fillWeight: 1.5,
        hachureGap: 10,
        curveFitting: 1,
        bowing: 1,
        cornerRadius: element.cornerRadius,
        opacity: currentAlpha
      };
      
      switch (element.type) {
        case 'rectangle':
          rc.rectangle(0, 0, element.width, element.height, fillOptions);
          break;
        case 'ellipse':
          rc.ellipse(element.width / 2, element.height / 2, element.width, element.height, fillOptions);
          break;
        case 'diamond':
          const centerX = element.width / 2;
          const centerY = element.height / 2;
          const diamondPoints = [
            [centerX, 0] as [number, number],
            [element.width, centerY] as [number, number],
            [centerX, element.height] as [number, number],
            [0, centerY] as [number, number]
          ];
          rc.polygon(diamondPoints as any, fillOptions);
          break;
      }
    }
  }

  ctx.restore();
};

// Draw an arrowhead
const drawArrowhead = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  strokeWidth: number,
  alpha: number = 1
) => {
  const arrowSize = strokeWidth * 3;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(y, x));
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-arrowSize, -arrowSize / 2);
  ctx.lineTo(-arrowSize, arrowSize / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Render free draw strokes using perfect-freehand
const renderFreeDraw = (
  ctx: CanvasRenderingContext2D,
  element: FreeDrawElement
) => {
  if (!element.points || element.points.length < 2) {
    return;
  }
  
  // Extract points for perfect-freehand using absolute coordinates
  const points = element.points.map(([x, y, pressure]) => ({ 
    x, 
    y, 
    pressure: pressure || 1 
  }));
  
  // Generate stroke using perfect-freehand
  const stroke = getStroke(points, {
    size: element.strokeWidth,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: true
  });
  
  // Use current global alpha from context (set in renderScene for onion skin effect)
  
  // Draw fill if fillStyle is not none
  if (element.fillStyle !== 'none') {
    ctx.fillStyle = element.backgroundColor;
    ctx.beginPath();
    
    // Use absolute points for fill path
    element.points.forEach(([x, y], i) => {
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.closePath();
    ctx.fill();
  }
  
  // Draw stroke
  ctx.fillStyle = element.strokeColor;
  ctx.beginPath();
  
  // Use absolute points for stroke path
  stroke.forEach(([x, y], i) => {
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.closePath();
  ctx.fill();
};

// Render the entire scene with layer onion skin effect
export const renderScene = (
  ctx: CanvasRenderingContext2D,
  elements: ExcalidrawElement[],
  activeLayerId?: string,
  layers?: { id: string; visible: boolean }[],
  onionSkinOpacity: number = 0.3,
  backgroundColor: string = '#ffffff'
) => {
  // Clear canvas and fill with background color
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Provide default values for optional parameters
  const defaultActiveLayerId = activeLayerId || 'default';
  const defaultLayers = layers || [{ id: 'default', visible: true }];

  // Get active layer
  const activeLayer = defaultLayers.find(layer => layer.id === defaultActiveLayerId);
  if (!activeLayer) {
    // Even if no active layer found, still render elements
    // This ensures the canvas is not empty
    elements.forEach(element => {
      if (element.visible) {
        ctx.save();
        ctx.globalAlpha = element.opacity / 100;
        renderElement(ctx, element);
        ctx.restore();
      }
    });
    return;
  }
  
  // Render all elements
  elements.forEach(element => {
    // Skip invisible layers if layers are provided
    if (layers) {
      const elementLayer = layers.find(layer => layer.id === element.layerId);
      if (!elementLayer?.visible) return;
    }
    
    ctx.save();
    
    // Calculate base opacity from element
    const baseOpacity = element.opacity / 100;
    
    // Apply onion skin effect to non-active layers if layers and activeLayerId are provided
    if (layers && activeLayerId && element.layerId !== activeLayerId) {
      // Get element layer index and active layer index
      const elementLayerIndex = layers.findIndex(layer => layer.id === element.layerId);
      const activeLayerIndex = layers.findIndex(layer => layer.id === activeLayerId);
      
      // Calculate opacity based on layer hierarchy
      // The further below the layer is from active layer, the more transparent it is
      const layerDistance = elementLayerIndex - activeLayerIndex;
      let calculatedOpacity = onionSkinOpacity;
      
      // For layers below active layer, increase transparency based on distance
      if (layerDistance > 0) {
        // Each layer below active layer gets 10% more transparent
        calculatedOpacity = Math.max(0.1, onionSkinOpacity - (layerDistance * 0.1));
      }
      
      // Combine element opacity with calculated onion skin opacity
      ctx.globalAlpha = baseOpacity * calculatedOpacity;
    } else {
      // Use full element opacity
      ctx.globalAlpha = baseOpacity;
    }
    
    renderElement(ctx, element);
    ctx.restore();
  });
};

// Selection border rendering function
export const renderSelectionBorders = (
  ctx: CanvasRenderingContext2D,
  elements: ExcalidrawElement[],
  selectedElementIds: string[]
) => {
  selectedElementIds.forEach(elementId => {
    const element = elements.find(el => el.id === elementId);
    if (element && element.visible) {
      drawSelectionBorder(ctx, element);
    }
  });
};

// Draw selection border
export const drawSelectionBorder = (
  ctx: CanvasRenderingContext2D,
  element: ExcalidrawElement,
  zoom: number = 1
) => {
  const bounds = {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height
  };
  const handleSize = 12;

  ctx.save();
  
  // Apply rotation transformation for selection border
  ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
  ctx.rotate((element.angle * Math.PI) / 180);
  ctx.translate(-(element.x + element.width / 2), -(element.y + element.height / 2));
  
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  // Draw selection border
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

  // Draw rotation handle (bigger circle)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bounds.x + bounds.width / 2, bounds.y - 30, handleSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Draw resize handles (bigger squares)
  const handles = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width / 2, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x, y: bounds.y + bounds.height / 2 },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    { x: bounds.x, y: bounds.y + bounds.height },
    { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height }
  ];

  for (const handle of handles) {
    ctx.beginPath();
    ctx.rect(
      handle.x - handleSize / 2,
      handle.y - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
};

// Render a single element for animation preview
export const renderElementForAnimation = (
  ctx: CanvasRenderingContext2D,
  element: ExcalidrawElement
) => {
  ctx.save();
  // Don't apply opacity for animation preview - show full opacity
  // ctx.globalAlpha = element.opacity / 100;
  renderElement(ctx, element);
  ctx.restore();
};