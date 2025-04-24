export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  reactions?: Record<string, number>;
}

export interface LLMConfig {
  provider: 'openrouter' | 'openai' | 'deepseek' | 'anthropic' | 'custom';
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'openrouter',
  model: 'openai/gpt-3.5-turbo',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 2000,
}; 