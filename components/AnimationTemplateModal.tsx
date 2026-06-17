import React, { useState } from 'react';
import { X, Play, Sparkles, Type, Shapes, Mountain, Gamepad2 } from 'lucide-react';
import { ANIMATION_TEMPLATES, ANIM_CATEGORY_NAMES, getAllAnimCategories, AnimationTemplate } from '../data/animationTemplates';

interface AnimationTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: AnimationTemplate, brushSize: number) => void;
}

const ANIM_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  text: <Type size={16} />,
  shape: <Shapes size={16} />,
  scene: <Mountain size={16} />,
  fun: <Gamepad2 size={16} />,
};

const AnimationTemplateModal: React.FC<AnimationTemplateModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(2.5);

  if (!isOpen) return null;

  const categories = getAllAnimCategories();

  const filteredTemplates = selectedCategory === 'all'
    ? ANIMATION_TEMPLATES
    : ANIMATION_TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl w-[700px] max-h-[80vh] flex flex-col shadow-2xl border border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">动画模板</h2>
              <p className="text-xs text-gray-400">选择预设动画，带真实物理效果</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Categories */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${selectedCategory === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                  ${selectedCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                {ANIM_CATEGORY_ICONS[cat]}
                {ANIM_CATEGORY_NAMES[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template, brushSize)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className={`
                  group relative rounded-xl border p-4 transition-all duration-200 text-left
                  ${hoveredTemplate === template.id
                    ? 'border-orange-500 bg-gray-800 scale-[1.02] shadow-lg shadow-orange-500/10'
                    : 'border-gray-800 bg-gray-850 hover:border-gray-700'
                  }
                `}
              >
                {/* Icon + Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{getTemplateIcon(template.id)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      {template.name}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-700 text-gray-300">
                        {ANIM_CATEGORY_NAMES[template.category]}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Play size={10} />
                        {template.fps} FPS
                      </span>
                      <span>{template.easingConfig.position || '默认'} 缓动</span>
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                {hoveredTemplate === template.id && (
                  <div className="absolute inset-0 rounded-xl bg-orange-500/5 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm text-gray-400">画笔粗细</label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={brushSize}
              onChange={(e) => setBrushSize(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <span className="text-sm text-gray-300 w-8 text-right">{brushSize}</span>
            <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg">
              <div
                className="rounded-full bg-white"
                style={{ width: `${brushSize * 2.5}px`, height: `${brushSize * 2.5}px` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">动画模板使用物理引擎驱动，效果丝滑自然</p>
        </div>
      </div>
    </div>
  );
};

function getTemplateIcon(id: string): string {
  const icons: Record<string, string> = {
    'anim-bounce-text': '🏀',
    'anim-spring-in': '🎯',
    'anim-heartbeat': '💓',
    'anim-falling-leaf': '🍃',
    'anim-water-ripple': '💧',
    'anim-typewriter': '⌨️',
    'anim-sunrise': '🌅',
    'anim-twinkling-stars': '✨',
    'anim-growing-flower': '🌸',
    'anim-elastic-scale': '🔲',
  };
  return icons[id] || '🎬';
}

export default AnimationTemplateModal;
