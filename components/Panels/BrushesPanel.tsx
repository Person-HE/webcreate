import React from 'react';
import { useStore } from '../../store';

// Brush settings interface based on Excalidraw style
interface BrushSettings {
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  roughness: number;
  opacity: number;
  fillStyle: 'none' | 'solid' | 'hachure' | 'cross-hatch';
  cornerRadius: number;
}

const BrushesPanel = () => {
  const { 
    currentTool,
    brushSize,
    brushOpacity,
    roughness,
    setBrushSize,
    setBrushOpacity,
    setRoughness,
    brushColor,
    setColor,
    backgroundColor,
    setBackgroundColor,
    fillStyle,
    setFillStyle,
    strokeStyle,
    setStrokeStyle,
    cornerRadius,
    setCornerRadius
  } = useStore();

  // Common colors palette
  const COMMON_COLORS = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#d946ef', '#f43f5e', '#9ca3af', '#4b5563'
  ];

  // Stroke styles based on Excalidraw
  const STROKE_STYLES = [
    { value: 'solid', label: '实线', icon: '━━━' },
    { value: 'dashed', label: '虚线', icon: '─ ─ ─' },
    { value: 'dotted', label: '点线', icon: '⋅ ⋅ ⋅' }
  ];

  // Line styles (roughness levels)
  const LINE_STYLES = [
    { value: 0, label: '平滑', icon: '━━━' },
    { value: 1, label: '手绘', icon: '~' },
    { value: 2, label: '粗糙', icon: '≈' }
  ];

  // Corner radius options
  const CORNER_RADIUS_OPTIONS = [
    { value: 0, label: '直角', icon: '□' },
    { value: 1, label: '圆角', icon: '▢' }
  ];

  // Fill styles
  const FILL_STYLES = [
    { value: 'none', label: '无填充', icon: '○' },
    { value: 'solid', label: '实心', icon: '●' },
    { value: 'hachure', label: '斜线填充', icon: '╱╱╱' },
    { value: 'cross-hatch', label: '十字填充', icon: '╳╳╳' }
  ];

  // Render different settings based on tool type
  const renderToolSettings = () => {
    // For erase, selection, and fill tools, show only tool name
    if (['eraser', 'selection', 'fill'].includes(currentTool)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-lg font-semibold text-gray-400">
            {currentTool === 'eraser' && '擦除功能'}
            {currentTool === 'selection' && '选区功能'}
            {currentTool === 'fill' && '填充功能'}
          </div>
        </div>
      );
    }

    // For all tools, show basic settings
    const basicSettings = (
      <>
        {/* Stroke Width */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>描边宽度</span>
            <span className="font-semibold">{brushSize}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>

        {/* Stroke Color */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">描边</div>
          <div className="grid grid-cols-5 gap-2">
            {COMMON_COLORS.map((color, index) => (
              <button
                key={index}
                onClick={() => setColor(color)}
                className={`w-full aspect-square rounded transition-all hover:scale-110 ${
                  brushColor === color ? 'ring-2 ring-blue-500' : 'border border-gray-700'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Stroke Style - Excalidraw style */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">边框样式</div>
          <div className="flex gap-2">
            {STROKE_STYLES.map((style) => (
              <button
                key={style.value}
                className={`flex-1 py-2 px-3 bg-gray-800 border border-gray-700 rounded-md transition-colors text-center ${roughness === 0 ? 'hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'} ${strokeStyle === style.value ? 'border-blue-500 bg-blue-900/30' : ''}`}
                onClick={() => roughness === 0 && setStrokeStyle(style.value as 'solid' | 'dashed' | 'dotted')}
              >
                <div className="flex items-center justify-center gap-1 text-xs">
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Line Style (Roughness) */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">线条风格</div>
          <div className="flex gap-2">
            {LINE_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => setRoughness(style.value)}
                className={`flex-1 py-2 px-3 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors text-center ${
                  roughness === style.value ? 'border-blue-500 bg-blue-900/30' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-xs">
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>不透明度</span>
            <span className="font-semibold">{brushOpacity}%</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={brushOpacity} 
            onChange={(e) => setBrushOpacity(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
          />
        </div>
      </>
    );

    // For shape tools (rectangle, ellipse, diamond), show additional fill settings
    if (['rectangle', 'ellipse', 'diamond'].includes(currentTool)) {
      return (
        <>
          {basicSettings}
          
          {/* Fill Style */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">填充样式</div>
            <div className="grid grid-cols-2 gap-2">
              {FILL_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setFillStyle(style.value as any)}
                  className={`py-2 px-3 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors text-left ${
                    fillStyle === style.value ? 'border-blue-500 bg-blue-900/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span>{style.icon}</span>
                    <span>{style.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Corner Radius (for rectangles only) */}
          {currentTool === 'rectangle' && (
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2">边角</div>
              <div className="space-y-2">
                {/* Corner radius slider */}
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>圆角半径</span>
                  <span className="font-semibold">{cornerRadius}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  value={cornerRadius} 
                  onChange={(e) => roughness === 0 && setCornerRadius(parseInt(e.target.value))}
                  className={`w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 ${roughness === 0 ? '' : 'opacity-50 cursor-not-allowed'}`} 
                />
                
                {/* Preset buttons */}
                <div className="flex gap-2">
                  {CORNER_RADIUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => roughness === 0 && setCornerRadius(option.value)}
                      className={`flex-1 py-2 px-3 bg-gray-800 border border-gray-700 rounded-md transition-colors text-center ${roughness === 0 ? 'hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'} ${cornerRadius === option.value ? 'border-blue-500 bg-blue-900/30' : ''}`}
                    >
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    // For line/arrow tools, show line-specific settings
    if (['line', 'arrow'].includes(currentTool)) {
      return (
        <>
          {basicSettings}
        </>
      );
    }

    // For brush tool, show brush-specific settings
    if (currentTool === 'brush') {
      return (
        <>
          {/* Brush Size */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>画笔大小</span>
              <span className="font-semibold">{brushSize}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            />
          </div>

          {/* Brush Opacity */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>不透明度</span>
              <span className="font-semibold">{brushOpacity}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={brushOpacity} 
              onChange={(e) => setBrushOpacity(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
            />
          </div>

          {/* Brush Roughness */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">手绘风格</div>
            <div className="flex gap-2">
              {LINE_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setRoughness(style.value)}
                  className={`flex-1 py-2 px-3 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors text-center ${
                    roughness === style.value ? 'border-blue-500 bg-blue-900/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <span>{style.icon}</span>
                    <span>{style.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Brush Color */}
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">颜色</div>
            <div className="grid grid-cols-5 gap-2">
              {COMMON_COLORS.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setColor(color)}
                  className={`w-full aspect-square rounded transition-all hover:scale-110 ${
                    brushColor === color ? 'ring-2 ring-blue-500' : 'border border-gray-700'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </>
      );
    }

    // Default settings
    return basicSettings;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      <div className="p-3 border-b border-gray-800">
        <h3 className="font-semibold text-sm">画笔设置</h3>
      </div>
      
      {/* Tool-specific Settings */}
      <div className="p-3 space-y-4 overflow-y-auto flex-1">
        {renderToolSettings()}
      </div>
    </div>
  );
};

export default BrushesPanel;