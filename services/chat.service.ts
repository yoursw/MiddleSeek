import { Message, LLMConfig, DEFAULT_LLM_CONFIG } from '../types/chat';

export class ChatService {
  private messages: Message[] = [];
  private llmConfig: LLMConfig = DEFAULT_LLM_CONFIG;

  constructor(config?: Partial<LLMConfig>) {
    if (config) {
      this.llmConfig = { ...DEFAULT_LLM_CONFIG, ...config };
    }
  }

  async sendMessage(text: string): Promise<Message> {
    console.log('ChatService: Sending message:', text);
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    this.messages.push(userMessage);
    console.log('ChatService: Added user message:', userMessage);

    try {
      const response = await this.callLLM(text);
      console.log('ChatService: Received LLM response:', response);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      this.messages.push(botMessage);
      console.log('ChatService: Added bot message:', botMessage);
      return botMessage;
    } catch (error) {
      console.error('ChatService: Error sending message:', error);
      throw error;
    }
  }

  private async callLLM(text: string): Promise<string> {
    const { provider, model, apiKey, baseUrl, temperature, maxTokens } = this.llmConfig;
    
    switch (provider) {
      case 'openrouter':
        return this.callOpenRouterAPI(text, model, apiKey, temperature, maxTokens);
      case 'deepseek':
        return this.callDeepSeekAPI(text, model, apiKey, temperature, maxTokens);
      case 'openai':
        return this.callOpenAIAPI(text, model, apiKey, temperature, maxTokens);
      case 'anthropic':
        return this.callAnthropicAPI(text, model, apiKey, temperature, maxTokens);
      case 'custom':
        if (!baseUrl) throw new Error('Base URL is required for custom provider');
        return this.callCustomAPI(text, model, apiKey, baseUrl, temperature, maxTokens);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  private async callOpenRouterAPI(
    text: string,
    model: string,
    apiKey: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    if (!apiKey) {
      console.error('OpenRouter API key is missing');
      throw new Error('OpenRouter API key is required');
    }

    console.log('Calling OpenRouter API with:', {
      model,
      textLength: text.length,
      temperature,
      maxTokens,
    });

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Middleseek',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: temperature ?? 0.7,
          max_tokens: maxTokens ?? 2000,
        }),
      });

      console.log('OpenRouter API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenRouter API error:', errorData);
        throw new Error(`OpenRouter API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('OpenRouter API success response:', data);

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from OpenRouter API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API call failed:', error);
      throw error;
    }
  }

  private async callDeepSeekAPI(
    text: string,
    model: string,
    apiKey: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    if (!apiKey) {
      throw new Error('DeepSeek API key is required');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callOpenAIAPI(
    text: string,
    model: string,
    apiKey: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    // Implementation for OpenAI API
    // TODO: Implement actual API call
    return `OpenAI response to: ${text}`;
  }

  private async callAnthropicAPI(
    text: string,
    model: string,
    apiKey: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    // Implementation for Anthropic API
    // TODO: Implement actual API call
    return `Anthropic response to: ${text}`;
  }

  private async callCustomAPI(
    text: string,
    model: string,
    apiKey: string,
    baseUrl: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    // Implementation for custom API
    // TODO: Implement actual API call
    return `Custom API response to: ${text}`;
  }

  getMessages(): Message[] {
    console.log('ChatService: Getting messages:', this.messages);
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
  }

  updateLLMConfig(config: Partial<LLMConfig>): void {
    this.llmConfig = { ...this.llmConfig, ...config };
  }

  getLLMConfig(): LLMConfig {
    return { ...this.llmConfig };
  }
} 