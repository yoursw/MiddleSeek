import { Message, LLMConfig } from '../types/chat';

const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com';

export class ChatService {
  private basePrompt: string = '';
  private messages: Message[] = [];
  private isLoading: boolean = false;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async loadBasePromptFromGitHub(repo: string, path: string): Promise<void> {
    try {
      const url = `${GITHUB_RAW_BASE_URL}/${repo}/main/${path}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load prompt: ${response.statusText}`);
      }
      this.basePrompt = await response.text();
    } catch (error) {
      console.error('Error loading base prompt:', error);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (this.isLoading) return '';

    this.isLoading = true;

    try {
      // Add user message to history
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      this.messages.push(userMessage);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': 'https://middleseek.app', // Required by OpenRouter
          'X-Title': 'MiddleSeek', // Optional but recommended
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: this.basePrompt },
            ...this.messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
          ],
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const botResponse = data.choices[0].message.content;

      // Add bot response to history
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      this.messages.push(botMessage);

      return botResponse;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  getMessages(): Message[] {
    return this.messages;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  clearMessages(): void {
    this.messages = [];
  }
} 