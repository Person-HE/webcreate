import React, { useState } from 'react';
import { X, Search, Grid3X3, Heart, BookOpen, Gamepad2, Briefcase, LayoutTemplate, Play, Type, Shapes, Mountain } from 'lucide-react';
import { TEMPLATES, CATEGORY_NAMES, getAllCategories, TemplateData } from '../data/templates';
import { ANIMATION_TEMPLATES, ANIM_CATEGORY_NAMES, getAllAnimCategories, AnimationTemplate } from '../data/animationTemplates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateData) => void;
  onSelectAnimTemplate?: (template: AnimationTemplate, brushSize?: number) => void;
  defaultTab?: 'static' | 'animation';
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  social: <Heart size={16} />,
  card: <LayoutTemplate size={16} />,
  diary: <BookOpen size={16} />,
  fun: <Gamepad2 size={16} />,
  business: <Briefcase size={16} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  social: 'from-pink-500 to-rose-400',
  card: 'from-amber-500 to-yellow-400',
  diary: 'from-violet-500 to-purple-400',
  fun: 'from-green-500 to-emerald-400',
  business: 'from-blue-500 to-cyan-400',
};

const ANIM_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  text: <Type size={16} />,
  shape: <Shapes size={16} />,
  scene: <Mountain size={16} />,
  fun: <Gamepad2 size={16} />,
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

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelectTemplate, onSelectAnimTemplate, defaultTab = 'static' }) => {
  const [activeTab, setActiveTab] = useState<'static' | 'animation'>(defaultTab);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [selectedAnimCategory, setSelectedAnimCategory] = useState<string>('all');
  const [animBrushSize, setAnimBrushSize] = useState(2.5);
  const [hoveredAnimTemplate, setHoveredAnimTemplate] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = getAllCategories();
  const animCategories = getAllAnimCategories();

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchSearch = !searchQuery ||
      template.name.includes(searchQuery) ||
      template.description.includes(searchQuery) ||
      template.tags.some(tag => tag.includes(searchQuery));
    return matchCategory && matchSearch;
  });

  const filteredAnimTemplates = selectedAnimCategory === 'all'
    ? ANIMATION_TEMPLATES
    : ANIMATION_TEMPLATES.filter(t => t.category === selectedAnimCategory);

  const renderThumbnail = (template: TemplateData) => {
    const elements = template.data.layers.flatMap(l => l.elements || []);
    const rects = elements.filter(e => e.type === 'rectangle');
    const texts = elements.filter(e => e.type === 'text');

    const bg = rects[0]?.backgroundColor || '#1f2937';
    const accent = rects[0]?.strokeColor || '#3b82f6';

    return (
      <div
        className="w-full h-full rounded-lg overflow-hidden relative"
        style={{ backgroundColor: bg }}
      >
        <div className="absolute inset-2 flex flex-col items-center justify-center gap-1">
          {texts.slice(0, 3).map((t, i) => (
            <div
              key={i}
              className="rounded px-1"
              style={{
                backgroundColor: i === 0 ? `${accent}22` : 'transparent',
                color: t.strokeColor || '#fff',
                fontSize: '8px',
                maxWidth: '80%',
                textAlign: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {t.text?.slice(0, 10) || ''}
            </div>
          ))}
        </div>
        <div
          className="absolute inset-0 rounded-lg border-2 opacity-40"
          style={{ borderColor: accent }}
        />
      </div>
    );
  };

  const handleTabChange = (tab: 'static' | 'animation') => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl w-[900px] max-h-[80vh] flex flex-col shadow-2xl border border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">选择模板</h2>
            <p className="text-sm text-gray-400 mt-1">选择一个模板快速开始创作</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Main tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => handleTabChange('static')}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'static' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <LayoutTemplate size={16} />
              静态模板
            </span>
            {activeTab === 'static' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
          <button
            onClick={() => handleTabChange('animation')}
            className={`flex-1 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'animation' ? 'text-orange-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Play size={16} />
              动画模板
            </span>
            {activeTab === 'animation' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
          </button>
        </div>

        {activeTab === 'static' ? (
          <>
            {/* Search + Categories for Static Templates */}
            <div className="p-4 border-b border-gray-800 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="搜索模板..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${selectedCategory === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="flex items-center gap-1.5">
                    <Grid3X3 size={14} />
                    全部
                  </span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${selectedCategory === cat
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                      }
                    `}
                  >
                    <span className="flex items-center gap-1.5">
                      {CATEGORY_ICONS[cat]}
                      {CATEGORY_NAMES[cat]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Static Template Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-lg">没有找到匹配的模板</p>
                  <p className="text-sm mt-2">试试其他关键词或分类</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      onMouseEnter={() => setHoveredTemplate(template.id)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                      className={`
                        group relative rounded-xl border transition-all duration-200 overflow-hidden text-left
                        ${hoveredTemplate === template.id
                          ? 'border-blue-500 bg-gray-800 scale-[1.02] shadow-lg shadow-blue-500/10'
                          : 'border-gray-800 bg-gray-850 hover:border-gray-700'
                        }
                      `}
                    >
                      <div className="aspect-[16/10] p-3">
                        {renderThumbnail(template)}
                      </div>
                      <div className="px-3 pb-3">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          {template.name}
                          <span className={`
                            inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
                            bg-gradient-to-r ${CATEGORY_COLORS[template.category]} text-white
                          `}>
                            {CATEGORY_NAMES[template.category]}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>
                      </div>
                      {hoveredTemplate === template.id && (
                        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-500">点击模板即可加载到画布，可在模板基础上自由修改</p>
            </div>
          </>
        ) : (
          <>
            {/* Animation Template Categories */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedAnimCategory('all')}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${selectedAnimCategory === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    }
                  `}
                >
                  全部
                </button>
                {animCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedAnimCategory(cat)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                      ${selectedAnimCategory === cat
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

            {/* Animation Template List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {filteredAnimTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => onSelectAnimTemplate?.(template, animBrushSize)}
                    onMouseEnter={() => setHoveredAnimTemplate(template.id)}
                    onMouseLeave={() => setHoveredAnimTemplate(null)}
                    className={`
                      group relative rounded-xl border p-4 transition-all duration-200 text-left
                      ${hoveredAnimTemplate === template.id
                        ? 'border-orange-500 bg-gray-800 scale-[1.02] shadow-lg shadow-orange-500/10'
                        : 'border-gray-800 bg-gray-850 hover:border-gray-700'
                      }
                    `}
                  >
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
                    {hoveredAnimTemplate === template.id && (
                      <div className="absolute inset-0 rounded-xl bg-orange-500/5 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer with brush size */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm text-gray-400">画笔粗细</label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={animBrushSize}
                  onChange={(e) => setAnimBrushSize(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <span className="text-sm text-gray-300 w-8 text-right">{animBrushSize}</span>
                <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg">
                  <div
                    className="rounded-full bg-white"
                    style={{ width: `${animBrushSize * 2.5}px`, height: `${animBrushSize * 2.5}px` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">动画模板使用物理引擎驱动，效果丝滑自然</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TemplateModal;
