import { ExcalidrawElement, ResizeHandle } from '../types';

// Element transformation utilities
export const getElementBounds = (element: ExcalidrawElement) => {
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height
  };
};

export const resizeElement = (
  element: ExcalidrawElement,
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number
): Partial<ExcalidrawElement> => {
  const updates: Partial<ExcalidrawElement> = { ...element };

  switch (handle) {
    case 'nw':
      updates.x = element.x + deltaX;
      updates.y = element.y + deltaY;
      updates.width = Math.max(1, element.width - deltaX);
      updates.height = Math.max(1, element.height - deltaY);
      break;
    case 'n':
      updates.y = element.y + deltaY;
      updates.height = Math.max(1, element.height - deltaY);
      break;
    case 'ne':
      updates.y = element.y + deltaY;
      updates.width = Math.max(1, element.width + deltaX);
      updates.height = Math.max(1, element.height - deltaY);
      break;
    case 'w':
      updates.x = element.x + deltaX;
      updates.width = Math.max(1, element.width - deltaX);
      break;
    case 'e':
      updates.width = Math.max(1, element.width + deltaX);
      break;
    case 'sw':
      updates.x = element.x + deltaX;
      updates.width = Math.max(1, element.width - deltaX);
      updates.height = Math.max(1, element.height + deltaY);
      break;
    case 's':
      updates.height = Math.max(1, element.height + deltaY);
      break;
    case 'se':
      updates.width = Math.max(1, element.width + deltaX);
      updates.height = Math.max(1, element.height + deltaY);
      break;
  }

  // === 新增：文本特殊处理 ===
  if (element.type === 'text') {
    // 文本缩放本质是改变字号
    // 计算缩放比例：新宽度 / 旧宽度
    const scale = updates.width! / element.width;
    const newFontSize = (element.fontSize || 24) * scale;
    
    return {
      ...updates,
      fontSize: newFontSize,
      // 文本高度通常由字号决定，重新计算高度以匹配字号
      height: newFontSize * 1.2 
    };
  }

  return updates;
};

export const isPointOnResizeHandle = (
  x: number,
  y: number,
  element: ExcalidrawElement,
  handleSize: number = 20
): ResizeHandle | null => {
  const bounds = getElementBounds(element);
  const halfHandle = handleSize / 2;
  
  // Element center
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const angleRad = (element.angle * Math.PI) / 180;

  // Helper function to rotate a point around center
  const rotatePoint = (px: number, py: number) => {
    const dx = px - centerX;
    const dy = py - centerY;
    return {
      x: centerX + dx * Math.cos(angleRad) - dy * Math.sin(angleRad),
      y: centerY + dx * Math.sin(angleRad) + dy * Math.cos(angleRad)
    };
  };

  // Rotation handle (above the element)
  const rotationPos = rotatePoint(bounds.x + bounds.width / 2, bounds.y - 30);
  const rotationDistance = Math.sqrt(
    Math.pow(x - rotationPos.x, 2) + Math.pow(y - rotationPos.y, 2)
  );
  if (rotationDistance <= handleSize) {
    return 'rotation';
  }

  // Check corner handles (with rotation)
  const handles: ResizeHandle[] = ['nw', 'ne', 'sw', 'se'];
  const corners = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x, y: bounds.y + bounds.height },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height }
  ];

  for (let i = 0; i < handles.length; i++) {
    const rotatedCorner = rotatePoint(corners[i].x, corners[i].y);
    if (
      x >= rotatedCorner.x - halfHandle &&
      x <= rotatedCorner.x + halfHandle &&
      y >= rotatedCorner.y - halfHandle &&
      y <= rotatedCorner.y + halfHandle
    ) {
      return handles[i];
    }
  }

  // Check edge handles (with rotation)
  const edgeHandles: ResizeHandle[] = ['n', 'w', 'e', 's'];
  const edges = [
    { x: bounds.x + bounds.width / 2, y: bounds.y },
    { x: bounds.x, y: bounds.y + bounds.height / 2 },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }
  ];

  for (let i = 0; i < edgeHandles.length; i++) {
    const rotatedEdge = rotatePoint(edges[i].x, edges[i].y);
    if (
      x >= rotatedEdge.x - halfHandle &&
      x <= rotatedEdge.x + halfHandle &&
      y >= rotatedEdge.y - halfHandle &&
      y <= rotatedEdge.y + halfHandle
    ) {
      return edgeHandles[i];
    }
  }

  return null;
};


