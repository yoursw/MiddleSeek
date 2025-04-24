import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { ChatInterface } from '../components/ChatInterface';
import { ChatService } from '../services/ChatService';
import { Message } from '../types/chat';

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatService] = useState(() => {
    console.log('Initializing ChatService with config:', {
      provider: 'openrouter',
      model: 'openai/gpt-3.5-turbo',
      apiKey: OPENROUTER_API_KEY ? '***' : 'missing',
    });
    return new ChatService({
      provider: 'openrouter',
      model: 'openai/gpt-3.5-turbo',
      apiKey: OPENROUTER_API_KEY,
    });
  });

  useEffect(() => {
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

      // Add bot response
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onReact={handleReaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight,
  },
});
