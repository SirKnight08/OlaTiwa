import React, { createContext, useContext, useState, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

type MenuItem = {
  label: string;
  screen: string;
  params?: any;
};

type MenuContextValue = {
  visible: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

const menuItems: MenuItem[] = [
  { label: 'Home', screen: 'Home' },
  { label: 'Categories', screen: 'Categories' },
  { label: 'Search', screen: 'Search' },
  { label: 'Favorites', screen: 'Favorites' },
  { label: 'Shopping List', screen: 'Shopping' },
  { label: 'Admin', screen: 'AdminLogin' },
];

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const slideAnim = useRef(new Animated.Value(-280)).current;

  const openMenu = () => {
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -280,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const toggleMenu = () => {
    if (visible) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const navigate = (screen: string, params?: any) => {
    closeMenu();
    setTimeout(() => {
      navigation.navigate(screen, params);
    }, 300);
  };

  return (
    <MenuContext.Provider value={{ visible, openMenu, closeMenu, toggleMenu }}>
      {children}
      {visible && (
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={closeMenu} />
          <Animated.View
            style={[
              styles.panel,
              {
                backgroundColor: theme.colors.surface,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.logoText}>O</Text>
              </View>
              <Text style={[styles.brand, { color: theme.colors.text }]}>OlaTiwa-Recipe</Text>
            </View>

            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <Pressable
                  key={item.label}
                  onPress={() => navigate(item.screen, item.params)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { 
                      backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
                      opacity: 0.9 - index * 0.05,
                    },
                  ]}
                >
                  <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
              <Text style={[styles.version, { color: theme.colors.textMuted }]}>OlaTiwa-Recipe v1.0</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    return {
      visible: false,
      openMenu: () => {},
      closeMenu: () => {},
      toggleMenu: () => {},
    };
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
  },
  menuItems: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  version: {
    fontSize: 13,
    fontWeight: '500',
  },
});
