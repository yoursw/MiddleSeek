import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  const [dots] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (isVisible) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(dots, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(dots, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isVisible, dots]);

  if (!isVisible) return null;

  const opacity1 = dots.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 1, 1, 1, 0],
  });

  const opacity2 = dots.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 0, 1, 1, 0],
  });

  const opacity3 = dots.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 0, 0, 1, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>Bot is typing</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
          <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
          <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontSize: 14,
    marginRight: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
    marginHorizontal: 1,
  },
}); 