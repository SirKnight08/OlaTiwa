import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { adminSignOut, fetchAdminStats, type AdminStats } from '../services/adminService';

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      setStats(await fetchAdminStats());
    } catch (err) {
      setError(err instanceof Error ? 'Could not load dashboard data. Check your connection.' : 'Load failed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleSignOut = async () => {
    await adminSignOut();
    navigation.replace('AdminLogin');
  };

  const statCards: { label: string; value: number }[] = stats
    ? [
        { label: 'Total Recipes', value: stats.totalRecipes },
        { label: 'Published', value: stats.publishedRecipes },
        { label: 'Drafts', value: stats.draftRecipes },
        { label: 'Featured', value: stats.featuredRecipes },
        { label: 'Categories', value: stats.totalCategories },
      ]
    : [];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>OlaTiwa-Recipe</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>Admin Dashboard</Text>
        </View>
        <Pressable onPress={handleSignOut} style={[styles.signOut, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.signOutText, { color: theme.colors.danger }]}>Sign out</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          <Pressable onPress={loadStats} style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.grid}>
            {statCards.map((card) => (
              <View key={card.label} style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{card.value}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{card.label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Manage</Text>

          <Pressable
            onPress={() => navigation.navigate('AdminRecipes')}
            style={[styles.manageCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.manageTitle, { color: theme.colors.text }]}>Recipes</Text>
            <Text style={[styles.manageSubtitle, { color: theme.colors.textMuted }]}>Create, edit, publish and unpublish recipes.</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('AdminCategories')}
            style={[styles.manageCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.manageTitle, { color: theme.colors.text }]}>Categories</Text>
            <Text style={[styles.manageSubtitle, { color: theme.colors.textMuted }]}>Add, edit, reorder and deactivate categories.</Text>
          </Pressable>

          <View style={[styles.notice, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}>
            <Text style={[styles.noticeText, { color: theme.colors.textMuted }]}>
              Changes are enforced by Supabase Row Level Security. Only accounts with the admin role can perform writes.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  signOut: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  manageCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  manageTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  manageSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  notice: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
