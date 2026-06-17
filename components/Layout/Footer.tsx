import React from 'react';
import { useStore } from '../../store';
import { LayoutTemplate } from 'lucide-react';

interface FooterProps {
  onOpenTemplates?: () => void;
}

const Footer = ({ onOpenTemplates }: FooterProps) => {
  const { activeBrushId, brushes, currentTool } = useStore();

  const activeBrush = brushes.find(b => b.id === activeBrushId);
  const toolNameMap: Record<string, string> = {
    'brush': '绘画',
    'eraser': '擦除',
    'smudge': '涂抹',
    'selection': '选区',
    'transform': '变换',
    'text': '文字',
    'fill': '填充',
    'rectangle': '矩形',
    'ellipse': '椭圆',
    'diamond': '菱形',
    'line': '直线',
    'arrow': '箭头',
    'image': '图片',
    'hand': '移动画布'
  };

  return (
    <footer className="h-8 bg-gray-950 border-t border-gray-800 flex items-center justify-between px-4 text-xs text-gray-500 select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${currentTool === 'brush' ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
          <span>{currentTool === 'brush' ? `画笔: ${activeBrush?.name}` : toolNameMap[currentTool] || currentTool}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {onOpenTemplates && (
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-xs"
          >
            <LayoutTemplate size={14} />
            <span>模板</span>
          </button>
        )}
        <div>
          {(() => {
            const canvas = document.querySelector('canvas');
            const w = canvas?.width || 1920;
            const h = canvas?.height || 1080;
            return `${w} x ${h} px • RGB`;
          })()}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
