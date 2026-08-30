import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { recipes } from '../data/recipes';
import { useTheme } from '../theme/ThemeContext';

export default function CookingModeScreen() {
  const route = useRoute<any>();
  const recipeId = route.params?.recipeId;
  const recipe = recipes.find((item) => item.id === recipeId) ?? recipes[0];
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { theme } = useTheme();

  const currentInstruction = recipe.steps[currentStep];
  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const duration = currentInstruction?.duration ?? 0;
    setTimer(duration);
    setIsRunning(false);
  }, [currentStep, currentInstruction]);

  useEffect(() => {
    if (timer === 0 && isRunning && currentInstruction) {
      Speech.speak(`Step ${currentStep + 1}: ${currentInstruction.instruction}`);
      setIsRunning(false);
    }
  }, [timer, isRunning, currentInstruction, currentStep]);

  const timerLabel = useMemo(() => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }, [timer]);

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, recipe.steps.length - 1));
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const restartTimer = () => setTimer(currentInstruction?.duration ?? 0);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>Cooking Mode</Text>
      <Text style={[styles.recipeTitle, { color: theme.colors.textMuted }]}>{recipe.title}</Text>
      <Text style={[styles.stepMeta, { color: theme.colors.primary }]}>STEP {currentStep + 1} OF {recipe.steps.length}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.stepText, { color: theme.colors.text }]}>{currentInstruction.instruction}</Text>
      </View>

      <View style={[styles.timerBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.timerLabel, { color: theme.colors.textMuted }]}>Timer</Text>
        <Text style={[styles.timer, { color: theme.colors.text }]}>{timerLabel}</Text>
        <View style={styles.timerActions}>
          <Pressable style={[styles.timerButton, { backgroundColor: theme.colors.primary }]} onPress={() => setIsRunning((v) => !v)}>
            <Text style={styles.timerButtonText}>{isRunning ? 'Pause' : 'Start'}</Text>
          </Pressable>
          <Pressable style={[styles.timerButtonSecondary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={restartTimer}>
            <Text style={[styles.timerButtonSecondaryText, { color: theme.colors.text }]}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable style={[styles.navButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={previousStep}>
          <Text style={[styles.navText, { color: theme.colors.text }]}>Previous</Text>
        </Pressable>
        <Pressable style={[styles.navButtonPrimary, { backgroundColor: theme.colors.primary }]} onPress={nextStep}>
          <Text style={styles.navTextPrimary}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
  },
  recipeTitle: {
    fontSize: 20,
    marginTop: 8,
  },
  stepMeta: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
  },
  stepText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  timerBox: {
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  timerLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  timer: {
    fontSize: 38,
    fontWeight: '800',
    marginTop: 8,
  },
  timerActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  timerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  timerButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  timerButtonSecondary: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  timerButtonSecondaryText: {
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  navText: {
    fontWeight: '700',
    fontSize: 16,
  },
  navButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  navTextPrimary: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
