import React from 'react';
import { useStore } from '../../store';
import {
  Hand,
  Brush,
  Eraser,
  MousePointer2,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  PencilLine,
  PaintBucket,
  Type,
  Image
} from 'lucide-react';
import { ToolType } from '../../types';

interface ToolButtonProps {
  tool: string;
  icon: any;
  active: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-xl transition-all flex items-center justify-center relative group ${
      active 
        ? 'bg-gray-100 text-gray-900 shadow-lg shadow-white/5' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
    title={tool}
  >
    <Icon size={20} />
    {/* Tooltip */}
    <span className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
      {tool}
    </span>
  </button>
);

const Toolbar = () => {
  const { currentTool, setTool, brushColor } = useStore();

  const tools: { id: ToolType, label: string, icon: any }[] = [
    { id: 'hand', label: '移动画布', icon: Hand },
    { id: 'brush', label: '绘画', icon: Brush },
    { id: 'eraser', label: '擦除', icon: Eraser },
    { id: 'fill', label: '填充', icon: PaintBucket },
    { id: 'text', label: '文本', icon: Type },
    { id: 'image', label: '图片', icon: Image },
    { id: 'selection', label: '选区', icon: MousePointer2 },
    { id: 'rectangle', label: '矩形', icon: Square },
    { id: 'ellipse', label: '圆形', icon: Circle },
    { id: 'diamond', label: '菱形', icon: Diamond },
    { id: 'line', label: '线条', icon: PencilLine },
    { id: 'arrow', label: '箭头', icon: ArrowRight },
  ];

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-2xl p-2 shadow-2xl flex flex-col space-y-2 transition-all duration-300 hover:shadow-3xl hover:shadow-blue-900/10">
      {tools.map((t) => (
        <ToolButton 
          key={t.id}
          tool={t.label} 
          icon={t.icon} 
          active={currentTool === t.id} 
          onClick={() => setTool(t.id)} 
        />
      ))}
      
      {/* Separator */}
      <div className="h-px bg-gray-700 mx-2 my-1"></div>
      
      {/* Color Indicator (Mini) */}
      <div className="w-10 h-10 rounded-full border-2 border-white/20 mx-auto cursor-pointer relative overflow-hidden transition-all duration-200 hover:scale-105 hover:border-white/40">
         <div className="absolute inset-0" style={{ backgroundColor: brushColor }}></div>
      </div>
    </div>
  );
};

export default Toolbar;
