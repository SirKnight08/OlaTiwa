import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { recipes } from '../data/recipes';
import { useAppContext } from '../AppContext';
import { useTheme } from '../theme/ThemeContext';

export default function RecipeDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const recipeId = route.params?.recipeId;
  const recipe = recipes.find((item) => item.id === recipeId) ?? recipes[0];
  const { favorites, toggleFavorite, addRecipeIngredientsToShoppingList, markRecipeViewed } = useAppContext();
  const [servings, setServings] = useState(recipe.servings);
  const { theme } = useTheme();

  const ingredientList = useMemo(() => {
    return recipe.ingredients.map((ingredient) => {
      const multiplier = servings / recipe.servings;
      const amount = Number((ingredient.quantity * multiplier).toFixed(2));
      return {
        ...ingredient,
        scaledAmount: amount,
      };
    });
  }, [recipe, servings]);

  React.useEffect(() => {
    markRecipeViewed(recipe.id);
  }, [recipe, markRecipeViewed]);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: recipe.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{recipe.title}</Text>
          <Pressable onPress={() => toggleFavorite(recipe.id)} style={[styles.favoriteButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.favoriteText, { color: theme.colors.primary }]}>{favorites.includes(recipe.id) ? '♥' : '♡'}</Text>
          </Pressable>
        </View>

        <Text style={[styles.description, { color: theme.colors.textMuted }]}>{recipe.description}</Text>

        <View style={styles.metaGrid}>
          <View style={[styles.metaBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>Cuisine</Text><Text style={[styles.metaValue, { color: theme.colors.text }]}>{recipe.cuisine}</Text></View>
          <View style={[styles.metaBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>Category</Text><Text style={[styles.metaValue, { color: theme.colors.text }]}>{recipe.category}</Text></View>
          <View style={[styles.metaBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>Prep</Text><Text style={[styles.metaValue, { color: theme.colors.text }]}>{recipe.preparationTime} min</Text></View>
          <View style={[styles.metaBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>Cook</Text><Text style={[styles.metaValue, { color: theme.colors.text }]}>{recipe.cookingTime} min</Text></View>
          <View style={[styles.metaBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>Total</Text><Text style={[styles.metaValue, { color: theme.colors.text }]}>{recipe.totalTime} min</Text></View>
          <View style={[styles.metaBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}><Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>Serves</Text><Text style={[styles.metaValue, { color: theme.colors.text }]}>{servings}</Text></View>
        </View>

        <View style={styles.servingsRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Adjust servings</Text>
          <View style={styles.stepper}>
            <Pressable onPress={() => setServings((current) => Math.max(1, current - 1))} style={[styles.stepButton, { backgroundColor: theme.colors.primary }]}><Text style={styles.stepButtonText}>−</Text></Pressable>
            <Text style={[styles.servingsText, { color: theme.colors.text }]}>{servings}</Text>
            <Pressable onPress={() => setServings((current) => current + 1)} style={[styles.stepButton, { backgroundColor: theme.colors.primary }]}><Text style={styles.stepButtonText}>+</Text></Pressable>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('CookingMode', { recipeId: recipe.id })}>
            <Text style={styles.primaryText}>Start Cooking</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={() => addRecipeIngredientsToShoppingList(recipe)}>
            <Text style={[styles.secondaryText, { color: theme.colors.text }]}>Add to Shopping</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ingredients</Text>
        {ingredientList.map((ingredient) => (
          <View key={ingredient.id} style={styles.listRow}>
            <Text style={[styles.dot, { color: theme.colors.primary }]}>•</Text>
            <Text style={[styles.listText, { color: theme.colors.text }]}>{ingredient.scaledAmount} {ingredient.unit} {ingredient.name}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Instructions</Text>
        {recipe.steps.map((step, index) => (
          <View key={step.id} style={[styles.stepCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.stepNumber, { color: theme.colors.primary }]}>Step {index + 1}</Text>
            <Text style={[styles.stepText, { color: theme.colors.text }]}>{step.instruction}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 260,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    flex: 1,
    marginRight: 12,
  },
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  favoriteText: {
    fontSize: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  metaBox: {
    minWidth: '30%',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
  },
  metaLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  servingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
  servingsText: {
    fontWeight: '700',
    fontSize: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryText: {
    fontWeight: '700',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dot: {
    fontSize: 18,
    marginRight: 8,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  stepCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  stepNumber: {
    fontWeight: '700',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
