import { z } from 'zod';

export const DifficultySchema = z.enum(['Easy', 'Medium', 'Hard']);

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  quantity: z.number().nonnegative(),
  unit: z.string().min(1),
});

export const RecipeStepSchema = z.object({
  id: z.string(),
  instruction: z.string().min(1),
  duration: z.number().nonnegative().optional(),
  optionalTimer: z.boolean().optional(),
});

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  cuisine: z.string().min(1),
  // A recipe may have a remote URL, or be empty when no image is available.
  image: z.union([z.string().url(), z.literal('')]),
  images: z.array(z.string()).optional(),
  preparationTime: z.number().nonnegative(),
  cookingTime: z.number().nonnegative(),
  totalTime: z.number().nonnegative(),
  difficulty: DifficultySchema,
  servings: z.number().positive(),
  ingredients: z.array(IngredientSchema).min(1),
  steps: z.array(RecipeStepSchema).min(1),
  tags: z.array(z.string()),
  featured: z.boolean(),
  popular: z.boolean(),
  tips: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateRecipeSchema = RecipeSchema.omit({ id: true });

export const UpdateRecipeSchema = RecipeSchema.partial().required({ id: true });

export type Difficulty = z.infer<typeof DifficultySchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type RecipeStep = z.infer<typeof RecipeStepSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;

export function validateRecipe(data: unknown) {
  return RecipeSchema.parse(data);
}

export function tryValidateRecipe(data: unknown) {
  const result = RecipeSchema.safeParse(data);
  if (!result.success) {
    return { success: false as const, error: result.error };
  }
  return { success: true as const, data: result.data };
}
