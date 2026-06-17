// AI Service Configuration Types
// Supports OpenAI-compatible API, Ollama local deployment, and custom API

export type AIProviderType = 'openai' | 'ollama' | 'custom' | 'mock';

export interface AIProviderConfig {
  type: AIProviderType;
  name: string; // Display name
  enabled: boolean;

  // OpenAI-compatible / Custom API
  apiUrl: string; // Base URL, e.g. https://api.openai.com/v1
  apiKey: string;
  model: string; // Model name, e.g. gpt-4o, deepseek-chat

  // Ollama specific
  ollamaUrl: string; // Default http://localhost:11434

  // Generation parameters
  temperature: number; // 0-2, default 0.7
  maxTokens: number; // Max output tokens, default 4096

  // Custom headers (for non-standard APIs)
  customHeaders: Record<string, string>;
}

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  type: 'mock',
  name: '内置演示',
  enabled: true,
  apiUrl: '',
  apiKey: '',
  model: '',
  ollamaUrl: 'http://localhost:11434',
  temperature: 0.7,
  maxTokens: 4096,
  customHeaders: {},
};

export const PRESET_PROVIDERS: Partial<AIProviderConfig>[] = [
  {
    type: 'openai',
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
  },
  {
    type: 'ollama',
    name: 'Ollama (本地)',
    ollamaUrl: 'http://localhost:11434',
    model: 'qwen2.5:7b',
  },
  {
    type: 'custom',
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  {
    type: 'custom',
    name: '硅基流动 (SiliconFlow)',
    apiUrl: 'https://api.siliconflow.cn/v1',
    model: 'Qwen/Qwen2.5-7B-Instruct',
  },
  {
    type: 'custom',
    name: '智谱 (GLM)',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
  },
];

// Storage key for AI config
export const AI_CONFIG_STORAGE_KEY = 'webcreate_ai_config';
