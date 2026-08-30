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
import AdminLoginScreen from '../screens/AdminLoginScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminRecipesScreen from '../screens/AdminRecipesScreen';
import AdminRecipeFormScreen from '../screens/AdminRecipeFormScreen';
import AdminCategoriesScreen from '../screens/AdminCategoriesScreen';
import { useTheme } from '../theme/ThemeContext';
import { getCurrentAdmin } from '../services/adminService';

type RootStackParamList = {
  MainTabs: undefined;
  RecipeDetail: { recipeId: string };
  CookingMode: { recipeId: string };
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminRecipes: undefined;
  AdminRecipeForm: { recipeId?: string };
  AdminCategories: undefined;
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

function AdminGuard({ children }: { children: React.ReactElement }) {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    getCurrentAdmin().then((session) => {
      if (mounted) {
        setIsAdmin(session?.isAdmin ?? false);
        setReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return null;
  return isAdmin ? children : <AdminLoginScreen />;
}

export default function AppNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="CookingMode" component={CookingModeScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen
        name="AdminDashboard"
        options={{ animation: 'fade' }}
      >
        {() => (
          <AdminGuard>
            <AdminDashboardScreen />
          </AdminGuard>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AdminRecipes"
        options={{ animation: 'slide_from_right' }}
      >
        {() => (
          <AdminGuard>
            <AdminRecipesScreen />
          </AdminGuard>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AdminRecipeForm"
        options={{ animation: 'slide_from_right' }}
      >
        {() => (
          <AdminGuard>
            <AdminRecipeFormScreen />
          </AdminGuard>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AdminCategories"
        options={{ animation: 'slide_from_right' }}
      >
        {() => (
          <AdminGuard>
            <AdminCategoriesScreen />
          </AdminGuard>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
