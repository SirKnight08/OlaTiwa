import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  onFinish: () => void;
};

export default function IntroScreen({ onFinish }: Props) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    sequence.start(() => {
      onFinish();
    });
  }, [fadeAnim, scaleAnim, slideAnim, onFinish]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.logoText}>O</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.textWrap,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.brand, { color: theme.colors.text }]}>OlaTiwa-Recipe</Text>
        <Text style={[styles.tagline, { color: theme.colors.textMuted }]}>Discover something delicious.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    marginBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
  },
  textWrap: {
    alignItems: 'center',
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500',
  },
});
