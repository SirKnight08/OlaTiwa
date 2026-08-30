import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { adminSignIn, adminSignOut } from '../services/adminService';

export default function AdminLoginScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await adminSignIn(trimmedEmail, password);
      if (!session.isAdmin) {
        setError('Your account does not have admin access.');
        await adminSignOut();
        return;
      }
      navigation.replace('AdminDashboard');
    } catch (err) {
      setError(err instanceof Error ? 'Invalid credentials. Please try again.' : 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.logoText}>O</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Admin Access</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
          Sign in to manage OlaTiwa-Recipe content.
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
          accessibilityLabel="Admin email"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry
          style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
          accessibilityLabel="Admin password"
        />

        {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          accessibilityLabel="Sign in"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={[styles.backText, { color: theme.colors.textMuted }]}>Back to app</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  error: {
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 16,
    alignSelf: 'center',
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
});