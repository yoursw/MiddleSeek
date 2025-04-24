import { Message, LLMConfig } from '../types/chat';
import { Client } from 'langsmith';
import { RunTree, RunTreeConfig } from 'langsmith';
import { v4 as uuidv4 } from 'uuid';

interface LangSmithRun {
  id: string;
  name: string;
  run_type: string;
  project_name: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  start_time: string;
  end_time?: string;
  metadata?: Record<string, any>;
}

const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com';

export class ChatService {
  private basePrompt: string = '';
  private messages: Message[] = [];
  private isLoading: boolean = false;
  private config: LLMConfig;
  private langsmithClient: Client | undefined = undefined;
  private runTree: RunTree | null = null;
  private langsmithConfig: {
    apiKey: string;
    apiUrl: string;
  } | undefined = undefined;

  constructor(config: LLMConfig, langsmithConfig?: { apiKey: string; apiUrl?: string }) {
    this.config = config;
    
    if (langsmithConfig?.apiKey) {
      this.langsmithConfig = {
        apiKey: langsmithConfig.apiKey,
        apiUrl: langsmithConfig.apiUrl || 'https://api.smith.langchain.com',
      };

      try {
        // Initialize LangSmith client with explicit configuration
        this.langsmithClient = new Client({
          apiKey: this.langsmithConfig.apiKey,
          apiUrl: this.langsmithConfig.apiUrl,
        });

        console.log('LangSmith client initialized:', {
          clientExists: !!this.langsmithClient,
          apiUrl: this.langsmithConfig.apiUrl,
        });
      } catch (error) {
        console.error('Failed to initialize LangSmith client:', error);
        this.langsmithClient = undefined;
      }
    } else {
      console.warn('LangSmith API key is missing. Analytics will not be tracked.');
    }
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
    let runId: string = uuidv4();

    try {
      // Add user message to history
      const userMessage: Message = {
        id: uuidv4(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      this.messages.push(userMessage);

      if (this.langsmithConfig?.apiKey) {
        try {
          console.log('Creating LangSmith run');

          // Generate a run ID before creating the run
          const generatedRunId = uuidv4();
          runId = generatedRunId;

          // Create a run using direct API call
          const runResponse = await fetch(`${this.langsmithConfig.apiUrl}/api/v1/runs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.langsmithConfig.apiKey,
            },
            body: JSON.stringify({
              id: generatedRunId,
              name: 'chat-interaction',
              run_type: 'llm',
              inputs: { 
                message,
                model: this.config.model,
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
              },
              project_name: 'middleseek',
              start_time: new Date().toISOString(),
            }),
          });

          console.log('Run creation response:', {
            status: runResponse.status,
            ok: runResponse.ok,
            statusText: runResponse.statusText,
          });

          if (!runResponse.ok) {
            const errorText = await runResponse.text();
            console.error('Failed to create run:', errorText);
            throw new Error(`Failed to create run: ${errorText}`);
          }

          const runData = await runResponse.json();
          console.log('Run creation data:', runData);

          // The API returns 202 Accepted with just a message, so we use our generated ID
          console.log('Created run with ID:', runId, {
            name: 'chat-interaction',
            runType: 'llm',
            projectName: 'middleseek',
            inputs: { 
              message,
              model: this.config.model,
              temperature: this.config.temperature,
              maxTokens: this.config.maxTokens,
            },
          });

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`,
              'HTTP-Referer': 'https://middleseek.app',
              'X-Title': 'MiddleSeek',
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
          console.log('API Response:', {
            hasChoices: !!data.choices,
            choicesLength: data.choices?.length,
            firstChoice: data.choices?.[0],
            message: data.choices?.[0]?.message,
            content: data.choices?.[0]?.message?.content,
            fullResponse: data
          });

          if (!data.choices?.[0]?.message?.content) {
            console.error('Invalid API response format:', {
              status: response.status,
              statusText: response.statusText,
              data: data
            });
            throw new Error(`Invalid response format from API: ${JSON.stringify(data)}`);
          }

          const botResponse = data.choices[0].message.content;

          // Update the run with the response
          if (runId) {
            try {
              console.log('Updating run:', {
                runId,
                url: `${this.langsmithConfig.apiUrl}/api/v1/runs/${runId}`,
              });

              const updateResponse = await fetch(`${this.langsmithConfig.apiUrl}/api/v1/runs/${runId}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': this.langsmithConfig.apiKey,
                },
                body: JSON.stringify({
                  end_time: new Date().toISOString(),
                  outputs: { 
                    response: botResponse,
                    usage: data.usage,
                  },
                  metadata: {
                    ...data.usage,
                    responseLength: botResponse.length,
                    completed: true,
                  }
                }),
              });

              console.log('Update response:', {
                status: updateResponse.status,
                ok: updateResponse.ok,
                statusText: updateResponse.statusText,
              });

              if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.error('Failed to update run:', {
                  runId,
                  status: updateResponse.status,
                  statusText: updateResponse.statusText,
                  error: errorText
                });
              } else {
                console.log('Successfully updated run:', {
                  runId,
                  status: 'success'
                });
              }
            } catch (updateError) {
              console.error('Error updating run:', {
                runId,
                error: updateError instanceof Error ? updateError.message : String(updateError),
              });
            }
          }

          // Add bot response to history
          const botMessage: Message = {
            id: uuidv4(),
            text: botResponse,
            sender: 'bot',
            timestamp: new Date(),
          };
          this.messages.push(botMessage);

          return botResponse;
        } catch (error) {
          console.error('Failed to create LangSmith run:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          throw error;
        }
      } else {
        console.warn('LangSmith API key is missing, skipping run creation');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'HTTP-Referer': 'https://middleseek.app',
          'X-Title': 'MiddleSeek',
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
      console.log('API Response:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0],
        message: data.choices?.[0]?.message,
        content: data.choices?.[0]?.message?.content,
        fullResponse: data
      });

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid API response format:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(`Invalid response format from API: ${JSON.stringify(data)}`);
      }

      const botResponse = data.choices[0].message.content;

      // End the run with the response
      if (this.runTree) {
        try {
          console.log('Ending run with ID:', runId);

          await this.runTree.end({
            outputs: { 
              response: botResponse,
              usage: data.usage,
            },
            metadata: {
              ...data.usage,
              responseLength: botResponse.length,
              completed: true,
            }
          });

          console.log('Successfully ended run:', {
            runId,
            status: 'success'
          });

        } catch (error) {
          console.error('Error ending LangSmith run:', {
            runId,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

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
      // Update the run with error if it exists
      if (runId && this.langsmithConfig?.apiKey) {
        try {
          console.error('Error in chat interaction:', {
            error: error instanceof Error ? error.message : String(error)
          });

          console.log('Updating run with error:', {
            runId,
            url: `${this.langsmithConfig.apiUrl}/api/v1/runs/${runId}`,
          });

          const updateResponse = await fetch(`${this.langsmithConfig.apiUrl}/api/v1/runs/${runId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.langsmithConfig.apiKey,
            },
            body: JSON.stringify({
              end_time: new Date().toISOString(),
              error: error instanceof Error ? error.message : String(error),
              metadata: {
                error: true,
                completed: true,
              }
            }),
          });

          console.log('Error update response:', {
            status: updateResponse.status,
            ok: updateResponse.ok,
            statusText: updateResponse.statusText,
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Failed to update run with error:', {
              status: updateResponse.status,
              statusText: updateResponse.statusText,
              error: errorText
            });
          } else {
            console.log('Updated run with error:', {
              runId,
              status: 'error'
            });
          }

        } catch (updateError) {
          console.error('Failed to update LangSmith run with error:', updateError);
        }
      }
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  clearMessages(): void {
    this.messages = [];
  }
} 