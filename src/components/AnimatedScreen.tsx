// Animated Screen Wrapper for smooth tab transitions

import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, Easing } from "react-native";
import { useIsFocused } from "@react-navigation/native";

interface AnimatedScreenProps {
  children: React.ReactNode;
  direction?: "left" | "right";
}

const AnimatedScreen: React.FC<AnimatedScreenProps> = ({
  children,
  direction = "right",
}) => {
  const isFocused = useIsFocused();
  const translateX = useRef(new Animated.Value(direction === "right" ? 50 : -50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isFocused) {
      // Animate in with smooth spring-like animation
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 7,
        }),
      ]).start();
    } else {
      // Animate out (subtle fade for background screen)
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: direction === "right" ? -20 : 20,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.99,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, direction, translateX, opacity, scale]);

  const animatedStyle = {
    transform: [
      { translateX },
      { scale },
    ],
    opacity,
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AnimatedScreen;

