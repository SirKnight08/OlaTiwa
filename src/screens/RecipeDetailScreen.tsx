import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { recipes } from '../data/recipes';
import { useAppContext } from '../AppContext';
import { theme } from '../theme';

export default function RecipeDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const recipeId = route.params?.recipeId;
  const recipe = recipes.find((item) => item.id === recipeId) ?? recipes[0];
  const { favorites, toggleFavorite, addRecipeIngredientsToShoppingList, markRecipeViewed } = useAppContext();
  const [servings, setServings] = useState(recipe.servings);

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
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: recipe.image }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Pressable onPress={() => toggleFavorite(recipe.id)} style={styles.favoriteButton}>
            <Text style={styles.favoriteText}>{favorites.includes(recipe.id) ? '♥' : '♡'}</Text>
          </Pressable>
        </View>

        <Text style={styles.description}>{recipe.description}</Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaBox}><Text style={styles.metaLabel}>Cuisine</Text><Text style={styles.metaValue}>{recipe.cuisine}</Text></View>
          <View style={styles.metaBox}><Text style={styles.metaLabel}>Category</Text><Text style={styles.metaValue}>{recipe.category}</Text></View>
          <View style={styles.metaBox}><Text style={styles.metaLabel}>Prep</Text><Text style={styles.metaValue}>{recipe.preparationTime} min</Text></View>
          <View style={styles.metaBox}><Text style={styles.metaLabel}>Cook</Text><Text style={styles.metaValue}>{recipe.cookingTime} min</Text></View>
          <View style={styles.metaBox}><Text style={styles.metaLabel}>Total</Text><Text style={styles.metaValue}>{recipe.totalTime} min</Text></View>
          <View style={styles.metaBox}><Text style={styles.metaLabel}>Serves</Text><Text style={styles.metaValue}>{servings}</Text></View>
        </View>

        <View style={styles.servingsRow}>
          <Text style={styles.sectionTitle}>Adjust servings</Text>
          <View style={styles.stepper}>
            <Pressable onPress={() => setServings((current) => Math.max(1, current - 1))} style={styles.stepButton}><Text style={styles.stepButtonText}>−</Text></Pressable>
            <Text style={styles.servingsText}>{servings}</Text>
            <Pressable onPress={() => setServings((current) => current + 1)} style={styles.stepButton}><Text style={styles.stepButtonText}>+</Text></Pressable>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('CookingMode', { recipeId: recipe.id })}>
            <Text style={styles.primaryText}>Start Cooking</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => addRecipeIngredientsToShoppingList(recipe)}>
            <Text style={styles.secondaryText}>Add to Shopping</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        {ingredientList.map((ingredient) => (
          <View key={ingredient.id} style={styles.listRow}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.listText}>{ingredient.scaledAmount} {ingredient.unit} {ingredient.name}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.steps.map((step, index) => (
          <View key={step.id} style={styles.stepCard}>
            <Text style={styles.stepNumber}>Step {index + 1}</Text>
            <Text style={styles.stepText}>{step.instruction}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  image: {
    width: '100%',
    height: 260,
  },
  content: {
    padding: theme.spacing.md,
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
    color: theme.colors.text,
    flex: 1,
    marginRight: 12,
  },
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  favoriteText: {
    fontSize: 20,
    color: theme.colors.primary,
  },
  description: {
    color: theme.colors.textMuted,
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
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
    color: theme.colors.text,
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
    backgroundColor: theme.colors.primary,
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
    color: theme.colors.text,
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
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dot: {
    color: theme.colors.primary,
    fontSize: 18,
    marginRight: 8,
  },
  listText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  stepCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 12,
  },
  stepNumber: {
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
});
