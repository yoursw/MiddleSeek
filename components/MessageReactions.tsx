import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Reaction {
  type: 'clarity' | 'support' | 'prevention' | 'liberation' | 'reversal';
  score: number;
  icon: string;
}

interface MessageReactionsProps {
  onReact: (reactionType: string) => void;
  reactions: Record<string, number>;
}

const REACTIONS: Reaction[] = [
  { type: 'clarity', score: 1, icon: 'bulb' },
  { type: 'support', score: 2, icon: 'heart' },
  { type: 'prevention', score: 3, icon: 'shield' },
  { type: 'liberation', score: 4, icon: 'key' },
  { type: 'reversal', score: 5, icon: 'sync' },
];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  onReact,
  reactions,
}) => {
  return (
    <View style={styles.container}>
      {REACTIONS.map((reaction) => {
        const isActive = Boolean(reactions[reaction.type]);
        return (
          <TouchableOpacity
            key={reaction.type}
            style={[
              styles.reactionButton,
              isActive ? styles.reactionButtonActive : undefined
            ]}
            onPress={() => onReact(reaction.type)}
            accessibilityLabel={`${reaction.type} reaction`}
            accessibilityHint={`Double tap to add ${reaction.type} reaction`}
          >
            <Ionicons
              name={reaction.icon as any}
              size={20}
              color={isActive ? '#007AFF' : '#666'}
            />
            {reactions[reaction.type] > 0 && (
              <Text style={styles.reactionCount}>
                {reactions[reaction.type]}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  reactionButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 4,
  },
}); 