import React, { useState } from 'react';
import { X, Sparkles, Loader2, Wand2, Settings } from 'lucide-react';
import { AIProviderConfig } from '../services/aiConfig';

interface AIDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, brushSize: number) => Promise<void>;
  onOpenSettings: () => void;
  aiConfig: AIProviderConfig;
}

// Preset prompts for quick selection
const PRESET_PROMPTS = [
  { icon: '🏠', label: '小房子', prompt: '一栋可爱的小房子，有烟囱冒着烟，旁边有棵树' },
  { icon: '🌅', label: '日落风景', prompt: '海边日落，有海浪和沙滩' },
  { icon: '🌸', label: '花朵', prompt: '一束美丽的花，有向日葵和玫瑰' },
  { icon: '🐱', label: '小猫', prompt: '一只可爱的小猫坐在地上' },
  { icon: '⛰️', label: '山水', prompt: '中国水墨风格的山水画' },
  { icon: '🚀', label: '火箭', prompt: '一枚火箭飞向太空，周围有星星' },
];

const AIDrawModal: React.FC<AIDrawModalProps> = ({ isOpen, onClose, onGenerate, onOpenSettings, aiConfig }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(2.5);

  if (!isOpen) return null;

  const isMock = aiConfig.type === 'mock';

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入描述内容');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      await onGenerate(prompt.trim(), brushSize);
      onClose();
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    setError(null);
  };

  const getProviderLabel = () => {
    switch (aiConfig.type) {
      case 'mock': return '内置演示';
      case 'openai': return `OpenAI · ${aiConfig.model || 'gpt-4o'}`;
      case 'ollama': return `Ollama · ${aiConfig.model || '本地模型'}`;
      case 'custom': return `${aiConfig.name || '自定义'} · ${aiConfig.model || ''}`;
      default: return '未配置';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl w-[560px] shadow-2xl border border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI 智能绘图</h2>
              <p className="text-xs text-gray-400">描述你想要的画面，AI 帮你起稿</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="AI 服务配置"
            >
              <Settings size={18} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Current provider indicator */}
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isMock ? 'bg-yellow-400' : 'bg-green-400'}`} />
              <span className="text-xs text-gray-400">当前服务: <span className="text-gray-300">{getProviderLabel()}</span></span>
            </div>
            <button
              onClick={onOpenSettings}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              切换
            </button>
          </div>

          {/* Brush thickness selector */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">画笔粗细</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={brushSize}
                onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-sm text-gray-300 w-8 text-right">{brushSize}</span>
              <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg">
                <div
                  className="rounded-full bg-white"
                  style={{ width: `${brushSize * 3}px`, height: `${brushSize * 3}px` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>精细</span>
              <span>粗犷</span>
            </div>
          </div>

          {/* Preset prompts */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">快速选择</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROMPTS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => handlePresetClick(preset.prompt)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg text-sm text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">描述你想要画的内容</label>
            <textarea
              value={prompt}
              onChange={e => { setPrompt(e.target.value); setError(null); }}
              placeholder="例如：一栋可爱的小房子，旁边有棵树，天上飘着白云..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-500">
            {isMock ? (
              <p>当前为内置演示模式，仅支持预设关键词匹配。配置 AI 服务后可生成任意图形。</p>
            ) : (
              <p>AI 会根据你的描述生成手绘风格的草图，你可以在生成后自由修改和调整。</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                开始生成
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDrawModal;
