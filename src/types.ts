export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export type RecipeStep = {
  id: string;
  instruction: string;
  duration?: number;
  optionalTimer?: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: string;
  cuisine: string;
  image: string;
  preparationTime: number;
  cookingTime: number;
  totalTime: number;
  difficulty: Difficulty;
  servings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  tags: string[];
  featured: boolean;
  popular: boolean;
};

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  recipeId?: string;
};
