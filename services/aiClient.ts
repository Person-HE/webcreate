// AI Client - Universal LLM API Client
// Supports OpenAI-compatible API, Ollama local deployment, and custom APIs

import { AIProviderConfig } from './aiConfig';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface LLMClient {
  chat(messages: LLMMessage[]): Promise<LLMResponse>;
  testConnection(): Promise<boolean>;
}

// ============================================================
// OpenAI-compatible API Client
// Works with: OpenAI, DeepSeek, SiliconFlow, GLM, etc.
// ============================================================
class OpenAICompatibleClient implements LLMClient {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    const url = `${this.config.apiUrl.replace(/\/$/, '')}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.customHeaders,
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const body = {
      model: this.config.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API 请求失败 (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('API 返回格式异常：未找到生成内容');
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
      } : undefined,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.apiUrl.replace(/\/$/, '')}/models`;
      const headers: Record<string, string> = {
        ...this.config.customHeaders,
      };
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
      return response.ok;
    } catch {
      // Some APIs don't have /models endpoint, try a minimal chat request
      try {
        await this.chat([
          { role: 'user', content: 'Hi' }
        ]);
        return true;
      } catch {
        return false;
      }
    }
  }
}

// ============================================================
// Ollama API Client
// ============================================================
class OllamaClient implements LLMClient {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    const url = `${this.config.ollamaUrl.replace(/\/$/, '')}/api/chat`;

    const body = {
      model: this.config.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Ollama 请求失败 (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();

    if (!data.message?.content) {
      throw new Error('Ollama 返回格式异常：未找到生成内容');
    }

    return {
      content: data.message.content,
      usage: data.eval_count ? {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
      } : undefined,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.ollamaUrl.replace(/\/$/, '')}/api/tags`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const url = `${this.config.ollamaUrl.replace(/\/$/, '')}/api/tags`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.models || []).map((m: any) => m.name || m.model);
    } catch {
      return [];
    }
  }
}

// ============================================================
// Factory function
// ============================================================
export function createLLMClient(config: AIProviderConfig): LLMClient {
  switch (config.type) {
    case 'openai':
    case 'custom':
      return new OpenAICompatibleClient(config);
    case 'ollama':
      return new OllamaClient(config);
    default:
      throw new Error(`不支持的 AI 提供商类型: ${config.type}`);
  }
}

// Helper: get Ollama client for model listing
export function getOllamaClient(config: AIProviderConfig): OllamaClient | null {
  if (config.type === 'ollama') {
    return new OllamaClient(config);
  }
  return null;
}
