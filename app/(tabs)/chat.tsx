import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { ChatInterface } from '../../components/ChatInterface';
import { ChatService } from '../../services/ChatService';
import { Message } from '../../types/chat';

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';

export default function ChatScreen() {
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

  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending',
      };
      setMessages(prev => [...prev, newMessage]);

      const response = await chatService.sendMessage(message);
      
      // Update user message status to 'sent'
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);

      // Update user message status to 'delivered'
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 500);

      // Update user message status to 'read'
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ));
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg =>
        msg.sender === 'user' && msg.status === 'sending'
          ? { ...msg, status: 'error' }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = (messageId: string, reactionType: string) => {
    setMessages(prev => prev.map(msg => {
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
    }));
  };

  console.log('Current messages:', messages);

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