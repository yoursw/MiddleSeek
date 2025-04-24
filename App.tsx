import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ChatInterface } from './components/ChatInterface';
import { ChatService } from './services/ChatService';
import { Message } from './types/chat';

const Stack = createNativeStackNavigator();

export default function App() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [chatService] = React.useState(() => {
    return new ChatService({
      provider: 'openrouter',
      model: 'deepseek/deepseek-chat-v3-0324',
      // model: 'deepseek/deepseek-chat-v3-0324:free',
      apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '',
    });
  });

  React.useEffect(() => {
    const loadBasePrompt = async () => {
      try {
        await chatService.loadBasePromptFromGitHub(
          'kusalatech/academic-exploration',
          'MCU/YourSW/MiddleSeek_Galactic_Dharma_Singularity_0e08b55b-3aa9-410a-959a-a4a8335409d4.md',
        );
        console.log('Base prompt loaded successfully');
      } catch (error) {
        console.error('Failed to load base prompt:', error);
      }
    };

    loadBasePrompt();
  }, [chatService]);

  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);

      const response = await chatService.sendMessage(message);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        reactions: {},
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = (messageId: string, reactionType: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {};
          return {
            ...msg,
            reactions: {
              ...reactions,
              [reactionType]: (reactions[reactionType] || 0) + 1,
            },
          };
        }
        return msg;
      }),
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Chat" 
          options={{ headerShown: false }}
        >
          {() => (
            <>
              <StatusBar style="auto" />
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onReact={handleReaction}
              />
            </>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}