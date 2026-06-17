import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';

// Common colors palette based on Excalidraw style
const COMMON_COLORS = [
  '#000000', // Black
  '#ffffff', // White
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Yellow
  '#84cc16', // Green
  '#10b981', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#d946ef', // Pink
  '#f43f5e', // Rose
  '#9ca3af', // Gray
  '#4b5563', // Dark Gray
  '#1f2937', // Very Dark Gray
  '#b45309', // Amber
  '#047857', // Emerald
  '#0e7490', // Cyan
  '#1d4ed8', // Blue
  '#4338ca', // Indigo
  '#7e22ce', // Purple
  '#991b1b', // Red
  '#78350f', // Orange
  '#65a30d', // Lime
  '#059669', // Green
  '#0284c7', // Sky
  '#2563eb', // Blue
  '#5b21b6', // Violet
  '#a21caf', // Fuchsia
];

// Custom color state interface
interface CustomColor {
  id: number;
  color: string;
}

// Color utilities
const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const ColorPanel = () => {
  const { brushColor, setColor, backgroundColor, setBackgroundColor, fillColor, setFillColor, bucketFillColor, setBucketFillColor, currentTool } = useStore();
  const [customColors, setCustomColors] = useState<CustomColor[]>([]);
  const [currentCustomColor, setCurrentCustomColor] = useState<string>('#ff0000');
  
  // HSL color picker state
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 });
  const [activeColorType, setActiveColorType] = useState<'stroke' | 'shapeFill' | 'bucketFill' | 'background'>('stroke');

  // Sync HSL with current color
  useEffect(() => {
    let currentColor = brushColor;
    if (activeColorType === 'shapeFill') currentColor = fillColor;
    else if (activeColorType === 'bucketFill') currentColor = bucketFillColor;
    else if (activeColorType === 'background') currentColor = backgroundColor;
    
    const hslColor = hexToHsl(currentColor);
    setHsl(hslColor);
  }, [brushColor, fillColor, bucketFillColor, backgroundColor, activeColorType]);

  // Automatically select bucket fill color type when fill tool is active
  useEffect(() => {
    if (currentTool === 'fill') {
      setActiveColorType('bucketFill');
    }
  }, [currentTool]);

  // Add custom color to the list
  const addCustomColor = () => {
    if (currentCustomColor && !customColors.some(color => color.color === currentCustomColor)) {
      setCustomColors([...customColors, { id: Date.now(), color: currentCustomColor }]);
    }
  };

  // Remove custom color from the list
  const removeCustomColor = (id: number) => {
    setCustomColors(customColors.filter(color => color.id !== id));
  };

  // Update color from HSL values
  const updateColorFromHsl = (newHsl?: { h: number; s: number; l: number }) => {
    const hslToUse = newHsl || hsl;
    const newColor = hslToHex(hslToUse.h, hslToUse.s, hslToUse.l);
    if (activeColorType === 'stroke') {
      setColor(newColor);
    } else if (activeColorType === 'shapeFill') {
      setFillColor(newColor);
    } else if (activeColorType === 'bucketFill') {
      setBucketFillColor(newColor);
    } else if (activeColorType === 'background') {
      setBackgroundColor(newColor);
    }
    setCurrentCustomColor(newColor);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200">
      <div className="p-3 border-b border-gray-800">
        <h3 className="font-semibold text-sm">颜色</h3>
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        {/* Color Type Selector */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">颜色类型</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveColorType('stroke')}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                activeColorType === 'stroke' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              笔触颜色
            </button>
            <button
              onClick={() => setActiveColorType('shapeFill')}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                activeColorType === 'shapeFill' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              图形填充
            </button>
            <button
              onClick={() => setActiveColorType('bucketFill')}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                activeColorType === 'bucketFill' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              填充工具
            </button>
            <button
              onClick={() => setActiveColorType('background')}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                activeColorType === 'background' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              画布背景
            </button>
          </div>
        </div>
        
        {/* Color Picker - HSL Sliders */}
        <div className="mb-6">
          <h4 className="text-xs text-gray-400 mb-3">调色工具</h4>
          
          {/* Color Preview */}
          <div className="w-full h-16 rounded-lg mb-4 flex items-center justify-center border border-gray-700">
            <div 
              className="w-12 h-12 rounded-full border-2 border-gray-600" 
              style={{ 
                backgroundColor: activeColorType === 'stroke' ? brushColor : activeColorType === 'shapeFill' ? fillColor : activeColorType === 'bucketFill' ? bucketFillColor : backgroundColor,
                backgroundImage: (activeColorType === 'stroke' ? brushColor : activeColorType === 'shapeFill' ? fillColor : activeColorType === 'bucketFill' ? bucketFillColor : backgroundColor) === '#ffffff' ? 'radial-gradient(#000 1px, transparent 1px)' : 'none',
                backgroundSize: '4px 4px'
              }}
            ></div>
          </div>
          
          {/* Hue Slider */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>色相</span>
              <span>{hsl.h}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={hsl.h}
              onChange={(e) => { const newHsl = { ...hsl, h: parseInt(e.target.value) }; setHsl(newHsl); updateColorFromHsl(newHsl); }}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(to right, red 0%, yellow 16.67%, lime 33.33%, cyan 50%, blue 66.67%, magenta 83.33%, red 100%)'
              }}
            />
          </div>
          
          {/* Saturation Slider */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>饱和度</span>
              <span>{hsl.s}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.s}
              onChange={(e) => { const newHsl = { ...hsl, s: parseInt(e.target.value) }; setHsl(newHsl); updateColorFromHsl(newHsl); }}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(${hsl.h}, 0%, 50%), hsl(${hsl.h}, 100%, 50%))`
              }}
            />
          </div>
          
          {/* Lightness Slider */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>亮度</span>
              <span>{hsl.l}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.l}
              onChange={(e) => { const newHsl = { ...hsl, l: parseInt(e.target.value) }; setHsl(newHsl); updateColorFromHsl(newHsl); }}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`
              }}
            />
          </div>
        </div>
        
        {/* Common Colors */}
        <div className="mb-4">
          <h4 className="text-xs text-gray-400 mb-2">常用颜色</h4>
          <div className="grid grid-cols-6 gap-1.5">
            {COMMON_COLORS.map((color, index) => {
              const getCurrentColor = () => {
                if (activeColorType === 'stroke') return brushColor;
                if (activeColorType === 'shapeFill') return fillColor;
                if (activeColorType === 'bucketFill') return bucketFillColor;
                if (activeColorType === 'background') return backgroundColor;
                return brushColor;
              };
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (activeColorType === 'stroke') {
                      setColor(color);
                    } else if (activeColorType === 'shapeFill') {
                      setFillColor(color);
                    } else if (activeColorType === 'bucketFill') {
                      setBucketFillColor(color);
                    } else if (activeColorType === 'background') {
                      setBackgroundColor(color);
                    }
                    setCurrentCustomColor(color);
                  }}
                  className={`w-full aspect-square rounded transition-all hover:scale-110 ${
                    getCurrentColor() === color 
                      ? 'ring-2 ring-blue-500' 
                      : 'border border-gray-700 hover:border-gray-600'
                  }`}
                  style={{ 
                    backgroundColor: color,
                    backgroundImage: color === '#ffffff' ? 'radial-gradient(#000 1px, transparent 1px)' : 'none',
                    backgroundSize: '4px 4px'
                  }}
                  title={color}
                >
                  {getCurrentColor() === color && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-white bg-gray-900 opacity-80"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Custom Color Picker */}
        <div className="mb-4">
          <h4 className="text-xs text-gray-400 mb-2">自定义颜色</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="color"
              value={currentCustomColor}
              onChange={(e) => setCurrentCustomColor(e.target.value)}
              className="w-10 h-8 rounded border border-gray-700 cursor-pointer"
            />
            <button
              onClick={addCustomColor}
              className="px-3 py-1 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 rounded transition-colors flex-1"
            >
              添加到自定义
            </button>
          </div>
          
          {/* Custom Colors Grid */}
          {customColors.length > 0 && (
            <div className="grid grid-cols-6 gap-1.5">
              {customColors.map((customColor) => {
                const getCurrentColor = () => {
                  if (activeColorType === 'stroke') return brushColor;
                  if (activeColorType === 'shapeFill') return fillColor;
                  if (activeColorType === 'bucketFill') return bucketFillColor;
                  if (activeColorType === 'background') return backgroundColor;
                  return brushColor;
                };
                
                return (
                  <div key={customColor.id} className="relative">
                    <button
                      onClick={() => {
                        if (activeColorType === 'stroke') {
                          setColor(customColor.color);
                        } else if (activeColorType === 'shapeFill') {
                          setFillColor(customColor.color);
                        } else if (activeColorType === 'bucketFill') {
                          setBucketFillColor(customColor.color);
                        } else if (activeColorType === 'background') {
                          setBackgroundColor(customColor.color);
                        }
                      }}
                      className={`w-full aspect-square rounded transition-all hover:scale-110 ${
                        getCurrentColor() === customColor.color 
                          ? 'ring-2 ring-blue-500' 
                          : 'border border-gray-700 hover:border-gray-600'
                      }`}
                      style={{ 
                        backgroundColor: customColor.color,
                        backgroundImage: customColor.color === '#ffffff' ? 'radial-gradient(#000 1px, transparent 1px)' : 'none',
                        backgroundSize: '4px 4px'
                      }}
                      title={customColor.color}
                    >
                      {getCurrentColor() === customColor.color && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full border-2 border-white bg-gray-900 opacity-80"></div>
                        </div>
                      )}
                    </button>
                  <button
                    onClick={() => removeCustomColor(customColor.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700"
                    title="删除颜色"
                  >
                    ×
                  </button>
                </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Color Information */}
        <div className="mt-auto pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: brushColor }}></span>
              <span>笔触: {brushColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded border border-gray-600" style={{ backgroundColor: fillColor }}></span>
              <span>图形填充: {fillColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded border border-gray-600" style={{ backgroundColor: bucketFillColor }}></span>
              <span>填充工具: {bucketFillColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded border border-gray-600" style={{ backgroundColor: backgroundColor }}></span>
              <span>画布背景: {backgroundColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPanel;