import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { recipes } from '../data/recipes';
import { theme } from '../theme';

export default function CookingModeScreen() {
  const route = useRoute<any>();
  const recipeId = route.params?.recipeId;
  const recipe = recipes.find((item) => item.id === recipeId) ?? recipes[0];
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

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
    <View style={styles.screen}>
      <Text style={styles.heading}>Cooking Mode</Text>
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Text style={styles.stepMeta}>STEP {currentStep + 1} OF {recipe.steps.length}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.card}>
        <Text style={styles.stepText}>{currentInstruction.instruction}</Text>
      </View>

      <View style={styles.timerBox}>
        <Text style={styles.timerLabel}>Timer</Text>
        <Text style={styles.timer}>{timerLabel}</Text>
        <View style={styles.timerActions}>
          <Pressable style={styles.timerButton} onPress={() => setIsRunning((v) => !v)}>
            <Text style={styles.timerButtonText}>{isRunning ? 'Pause' : 'Start'}</Text>
          </Pressable>
          <Pressable style={styles.timerButtonSecondary} onPress={restartTimer}>
            <Text style={styles.timerButtonSecondaryText}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.navButton} onPress={previousStep}>
          <Text style={styles.navText}>Previous</Text>
        </Pressable>
        <Pressable style={styles.navButtonPrimary} onPress={nextStep}>
          <Text style={styles.navTextPrimary}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  recipeTitle: {
    fontSize: 20,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  stepMeta: {
    marginTop: 14,
    fontSize: 13,
    color: theme.colors.primary,
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
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepText: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: theme.colors.text,
  },
  timerBox: {
    marginTop: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  timerLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  timer: {
    fontSize: 38,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 8,
  },
  timerActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  timerButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  timerButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  timerButtonSecondary: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  timerButtonSecondaryText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  navText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  navButtonPrimary: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  navTextPrimary: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
