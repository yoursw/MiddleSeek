import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageReactionsProps {
  onReact: (reactionType: string) => void;
  reactions: Record<string, number>;
}

const REACTION_TYPES = {
  thumbsUp: 'thumbs-up',
  heart: 'heart',
  laugh: 'happy',
  sad: 'sad',
  angry: 'angry',
};

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  onReact,
  reactions,
}) => {
  return (
    <View style={styles.container}>
      {Object.entries(REACTION_TYPES).map(([key, icon]) => (
        <TouchableOpacity
          key={key}
          style={styles.reactionButton}
          onPress={() => onReact(key)}
          accessible={true}
          accessibilityLabel={`React with ${key}`}
          accessibilityHint="Double tap to add this reaction"
        >
          <Ionicons name={icon as any} size={16} color="#666" />
          {reactions[key] > 0 && (
            <Text style={styles.count}>{reactions[key]}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  count: {
    marginLeft: 2,
    fontSize: 12,
    color: '#666',
  },
}); 