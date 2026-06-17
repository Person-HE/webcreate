import React, { useState, useEffect, useCallback } from 'react';
import { X, Settings, Wifi, WifiOff, Loader2, ChevronDown, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import {
  AIProviderConfig,
  AIProviderType,
  DEFAULT_AI_CONFIG,
  PRESET_PROVIDERS,
  AI_CONFIG_STORAGE_KEY,
} from '../services/aiConfig';
import { createLLMClient, getOllamaClient } from '../services/aiClient';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIProviderConfig;
  onConfigChange: (config: AIProviderConfig) => void;
}

const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose, config, onConfigChange }) => {
  const [localConfig, setLocalConfig] = useState<AIProviderConfig>(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
    setTestResult(null);
  }, [config]);

  const updateConfig = useCallback((updates: Partial<AIProviderConfig>) => {
    setLocalConfig(prev => {
      const next = { ...prev, ...updates };
      return next;
    });
    setTestResult(null);
  }, []);

  const handleProviderTypeChange = useCallback((type: AIProviderType) => {
    const preset = PRESET_PROVIDERS.find(p => p.type === type);
    setLocalConfig(prev => ({
      ...prev,
      type,
      name: preset?.name || prev.name,
      apiUrl: type === 'ollama' ? prev.ollamaUrl : (preset?.apiUrl || prev.apiUrl),
      model: preset?.model || prev.model,
    }));
    setTestResult(null);
  }, []);

  const handlePresetSelect = useCallback((preset: Partial<AIProviderConfig>) => {
    setLocalConfig(prev => ({
      ...prev,
      type: preset.type || prev.type,
      name: preset.name || prev.name,
      apiUrl: preset.apiUrl || prev.apiUrl,
      model: preset.model || prev.model,
    }));
    setTestResult(null);
  }, []);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (localConfig.type === 'mock') {
        setTestResult('success');
        return;
      }
      const client = createLLMClient(localConfig);
      const ok = await client.testConnection();
      setTestResult(ok ? 'success' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  }, [localConfig]);

  const handleFetchOllamaModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const ollamaClient = getOllamaClient(localConfig);
      if (ollamaClient) {
        const models = await ollamaClient.listModels();
        setOllamaModels(models);
      }
    } catch {
      setOllamaModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, [localConfig]);

  const handleSave = useCallback(() => {
    onConfigChange(localConfig);
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(localConfig));
    onClose();
  }, [localConfig, onConfigChange, onClose]);

  if (!isOpen) return null;

  const isOllama = localConfig.type === 'ollama';
  const isMock = localConfig.type === 'mock';
  const needsApiKey = !isOllama && !isMock;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl w-[600px] max-h-[85vh] shadow-2xl border border-gray-800 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Settings size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI 服务配置</h2>
              <p className="text-xs text-gray-400">配置 AI 绘图服务的 API 接口</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Provider Type Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">服务类型</label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { type: 'mock' as AIProviderType, label: '内置演示', desc: '无需配置' },
                { type: 'openai' as AIProviderType, label: 'OpenAI', desc: 'GPT-4o 等' },
                { type: 'ollama' as AIProviderType, label: 'Ollama', desc: '本地部署' },
                { type: 'custom' as AIProviderType, label: '自定义', desc: '兼容 API' },
              ]).map(opt => (
                <button
                  key={opt.type}
                  onClick={() => handleProviderTypeChange(opt.type)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    localConfig.type === opt.type
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-xs mt-0.5 opacity-60">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets for Custom type */}
          {localConfig.type === 'custom' && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">快速预设</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_PROVIDERS.filter(p => p.type === 'custom').map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      localConfig.name === preset.name && localConfig.apiUrl === preset.apiUrl
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ollama URL */}
          {isOllama && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Ollama 服务地址</label>
              <input
                type="text"
                value={localConfig.ollamaUrl}
                onChange={e => updateConfig({ ollamaUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">确保 Ollama 已启动并运行在此地址</p>
            </div>
          )}

          {/* API URL (for openai/custom) */}
          {!isOllama && !isMock && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">API 地址</label>
              <input
                type="text"
                value={localConfig.apiUrl}
                onChange={e => updateConfig({ apiUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {/* API Key */}
          {needsApiKey && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={localConfig.apiKey}
                  onChange={e => updateConfig({ apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">API Key 仅保存在本地浏览器中，不会上传到任何服务器</p>
            </div>
          )}

          {/* Model Selection */}
          {!isMock && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">模型</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localConfig.model}
                  onChange={e => updateConfig({ model: e.target.value })}
                  placeholder={isOllama ? 'qwen2.5:7b' : 'gpt-4o'}
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                {isOllama && (
                  <button
                    onClick={handleFetchOllamaModels}
                    disabled={loadingModels}
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {loadingModels ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                    获取模型
                  </button>
                )}
              </div>
              {ollamaModels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ollamaModels.map(model => (
                    <button
                      key={model}
                      onClick={() => updateConfig({ model })}
                      className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                        localConfig.model === model
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generation Parameters */}
          {!isMock && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Temperature: {localConfig.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localConfig.temperature}
                  onChange={e => updateConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>精确</span>
                  <span>创意</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  最大 Token: {localConfig.maxTokens}
                </label>
                <input
                  type="range"
                  min="1024"
                  max="16384"
                  step="512"
                  value={localConfig.maxTokens}
                  onChange={e => updateConfig({ maxTokens: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1024</span>
                  <span>16384</span>
                </div>
              </div>
            </div>
          )}

          {/* Mock mode info */}
          {isMock && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-sm text-yellow-400 font-medium mb-1">内置演示模式</p>
              <p className="text-xs text-yellow-400/70">
                此模式使用本地预设图形生成，无需连接外部 AI 服务。支持的关键词：脸、猫、房子、树、太阳、云、山、花、海浪等。
                如需生成更丰富的图形，请配置 OpenAI 兼容 API 或本地 Ollama 服务。
              </p>
            </div>
          )}

          {/* Test Connection */}
          {!isMock && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleTest}
                disabled={testing}
                className="px-4 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-all flex items-center gap-2"
              >
                {testing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : testResult === 'success' ? (
                  <Wifi size={14} className="text-green-400" />
                ) : testResult === 'fail' ? (
                  <WifiOff size={14} className="text-red-400" />
                ) : (
                  <Wifi size={14} />
                )}
                {testing ? '测试中...' : '测试连接'}
              </button>
              {testResult === 'success' && (
                <span className="text-sm text-green-400">连接成功</span>
              )}
              {testResult === 'fail' && (
                <span className="text-sm text-red-400">连接失败，请检查配置</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-800 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;
