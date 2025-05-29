import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  AccessibilityInfo,
  Clipboard,
  ToastAndroid,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Message } from '../types/chat';
import { TypingIndicator } from './TypingIndicator';
import { MessageReactions } from './MessageReactions';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
  onReact?: (messageId: string, reactionType: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  messages,
  isLoading,
  onReact,
}) => {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (isLoading) {
      AccessibilityInfo.announceForAccessibility('Processing your message...');
    }
  }, [isLoading]);

  const handleSend = async () => {
    if (inputText.trim()) {
      try {
        await onSendMessage(inputText);
        setInputText('');
      } catch (error) {
        console.error('Error sending message:', error);
        AccessibilityInfo.announceForAccessibility('Error sending message');
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
        ]}
        accessible={true}
        accessibilityLabel={`${isUser ? 'You' : 'Bot'} said: ${item.text}`}
        accessibilityRole="text"
      >
        <View style={styles.messageHeader}>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={() => handleCopyText(item.text)}
            accessible={true}
            accessibilityLabel="Copy message"
            accessibilityHint="Double tap to copy this message to clipboard"
          >
            <Ionicons name="copy-outline" size={16} color={isUser ? "#fff" : "#666"} />
          </TouchableOpacity>
        </View>
        <Markdown
          style={{
            body: {
              ...styles.messageText,
              ...(isUser ? styles.userMessageText : styles.botMessageText),
            },
            code_inline: {
              backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              padding: 4,
              borderRadius: 4,
            },
            code_block: {
              backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              padding: 8,
              borderRadius: 4,
              marginVertical: 8,
            },
            link: {
              color: isUser ? '#fff' : '#007AFF',
              textDecorationLine: 'underline',
            },
          }}
        >
          {item.text}
        </Markdown>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.botTimestamp
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {!isUser && onReact && (
          <MessageReactions
            onReact={(type) => onReact(item.id, type)}
            reactions={item.reactions || {}}
          />
        )}
      </View>
    );
  };

  const handleKeyPress = (e: any) => {
    if (Platform.OS === 'web') {
      if (e.key === 'Enter' && !e.ctrlKey) {
        e.preventDefault();
        handleSend();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        // Allow default behavior (new line) when Ctrl+Enter is pressed
        return;
      }
    }
  };

  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    
    // Show confirmation based on platform
    if (Platform.OS === 'android') {
      ToastAndroid.show('Message copied to clipboard', ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      Alert.alert('Copied', 'Message copied to clipboard');
    } else {
      // For web or other platforms
      console.log('Message copied to clipboard');
    }
    
    AccessibilityInfo.announceForAccessibility('Message copied to clipboard');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        style={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet. Start a conversation!</Text>
          </View>
        }
      />
      {isLoading && <TypingIndicator isVisible={true} />}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
          onKeyPress={handleKeyPress}
          onSubmitEditing={handleSend}
          accessible={true}
          accessibilityLabel="Message input field"
          accessibilityHint="Type your message and press send. Press Ctrl+Enter for a new line."
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isLoading}
          accessible={true}
          accessibilityLabel="Send message"
          accessibilityHint="Double tap to send your message"
        >
          <Ionicons
            name="send"
            size={24}
            color={isLoading ? '#ccc' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  copyButton: {
    padding: 2,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTimestamp: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
}); 