import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import SearchScreen from '../screens/SearchScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import CookingModeScreen from '../screens/CookingModeScreen';
import { useTheme } from '../theme/ThemeContext';

type RootStackParamList = {
  MainTabs: undefined;
  RecipeDetail: { recipeId: string };
  CookingMode: { recipeId: string };
};

type MainTabsParamList = {
  Home: undefined;
  Categories: { category?: string };
  Search: undefined;
  Favorites: undefined;
  Shopping: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 68,
          paddingBottom: 8,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Shopping" component={ShoppingListScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="CookingMode" component={CookingModeScreen} />
    </Stack.Navigator>
  );
}
