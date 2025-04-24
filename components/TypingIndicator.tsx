import React, { useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible }) => {
  const animations = [
    React.useRef(new Animated.Value(0)).current,
    React.useRef(new Animated.Value(0)).current,
    React.useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    if (isVisible) {
      const sequence = animations.map((animation, index) => {
        return Animated.sequence([
          Animated.delay(index * 200),
          Animated.loop(
            Animated.sequence([
              Animated.timing(animation, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(animation, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          ),
        ]);
      });

      Animated.parallel(sequence).start();
    } else {
      animations.forEach(animation => {
        animation.stopAnimation();
        animation.setValue(0);
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {animations.map((animation, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
    marginVertical: 8,
    marginLeft: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
    marginHorizontal: 2,
  },
}); 