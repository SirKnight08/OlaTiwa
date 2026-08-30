import React from 'react';
import { Text, TextStyle } from 'react-native';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
};

const iconMap: Record<string, { symbol: string; fallback?: string }> = {
  home: { symbol: '⌂' },
  search: { symbol: '⌕' },
  menu: { symbol: '☰' },
  close: { symbol: '✕' },
  back: { symbol: '←' },
  favorite: { symbol: '♥' },
  'favorite-outline': { symbol: '♡' },
  bookmark: { symbol: '◆' },
  shopping: { symbol: '🛒' },
  categories: { symbol: '☰' },
  settings: { symbol: '⚙' },
  profile: { symbol: '◉' },
  clock: { symbol: '◷' },
  timer: { symbol: '⏱' },
  servings: { symbol: '🍽' },
  ingredients: { symbol: '🥗' },
  cooking: { symbol: '🔥' },
  share: { symbol: '⤤' },
  more: { symbol: '⋯' },
  notifications: { symbol: '🔔' },
  add: { symbol: '+' },
  delete: { symbol: '🗑' },
  edit: { symbol: '✎' },
  check: { symbol: '✓' },
  arrowRight: { symbol: '→' },
  arrowLeft: { symbol: '←' },
};

export default function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  const entry = iconMap[name];
  if (!entry) {
    return <Text style={[{ fontSize: size, color }, style]}>{name}</Text>;
  }
  return (
    <Text style={[{ fontSize: size, color, lineHeight: size }, style]}>
      {entry.symbol}
    </Text>
  );
}
