import React, { useState } from 'react';
import { Palette, Sparkles, Pencil, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectTemplate: () => void;
  onAIDraw: () => void;
  onStartBlank: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectTemplate, onAIDraw, onStartBlank }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const quickActions = [
    {
      icon: <Palette size={28} />,
      title: '选模板开始',
      description: '海量精美模板，一键替换内容',
      gradient: 'from-blue-500 to-cyan-400',
      onClick: onSelectTemplate,
    },
    {
      icon: <Sparkles size={28} />,
      title: 'AI 帮我画',
      description: '描述你的想法，AI 自动起稿',
      gradient: 'from-purple-500 to-pink-400',
      onClick: onAIDraw,
    },
    {
      icon: <Pencil size={28} />,
      title: '直接开始画',
      description: '空白画布，自由创作',
      gradient: 'from-orange-500 to-yellow-400',
      onClick: onStartBlank,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(31,41,55,0.2) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-2xl w-full px-6">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-500/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            欢迎使用 <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">WebCreate</span>
          </h1>
          <p className="text-gray-400 text-lg">
            专业级 Web 绘图与动画创作工具
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`
                relative group p-6 rounded-2xl border transition-all duration-300 text-left
                ${hoveredCard === index
                  ? 'border-gray-600 bg-gray-800/80 scale-[1.02] shadow-xl'
                  : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800/40'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
                bg-gradient-to-br ${action.gradient} shadow-lg
                ${hoveredCard === index ? 'shadow-lg scale-110' : ''}
                transition-all duration-300
              `}>
                <span className="text-white">{action.icon}</span>
              </div>

              {/* Content */}
              <h3 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
                {action.title}
                <ChevronRight
                  size={16}
                  className={`
                    text-gray-500 transition-all duration-300
                    ${hoveredCard === index ? 'opacity-100 translate-x-1' : 'opacity-0'}
                  `}
                />
              </h3>
              <p className="text-gray-400 text-sm">{action.description}</p>

              {/* Hover glow */}
              {hoveredCard === index && (
                <div className={`
                  absolute inset-0 rounded-2xl opacity-20 pointer-events-none
                  bg-gradient-to-br ${action.gradient}
                `} />
              )}
            </button>
          ))}
        </div>

        {/* Features hint */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            支持图层管理 · 帧动画 · 物理引擎 · GIF/视频导出
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
