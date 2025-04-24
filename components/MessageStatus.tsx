import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return { name: 'time-outline', color: '#666' };
      case 'sent':
        return { name: 'checkmark', color: '#666' };
      case 'delivered':
        return { name: 'checkmark-done', color: '#666' };
      case 'read':
        return { name: 'checkmark-done', color: '#007AFF' };
      case 'error':
        return { name: 'alert-circle', color: '#FF3B30' };
      default:
        return null;
    }
  };

  const statusIcon = getStatusIcon();
  if (!statusIcon) return null;

  return (
    <View style={styles.container}>
      <Ionicons
        name={statusIcon.name as any}
        size={14}
        color={statusIcon.color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    alignSelf: 'flex-end',
  },
}); 