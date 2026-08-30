export type DatabaseCategory = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type DatabaseRecipe = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category_id: string | null;
  cuisine: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  preparation_time: number | null;
  cooking_time: number | null;
  total_time: number | null;
  servings: number | null;
  featured: boolean;
  popular: boolean;
  status: 'draft' | 'published' | 'archived';
  tips: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DatabaseIngredient = {
  id: string;
  recipe_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  display_order: number;
};

export type DatabaseRecipeStep = {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  duration: number | null;
  optional_timer: boolean;
  tips: string | null;
  display_order: number;
};

export type DatabaseRecipeImage = {
  id: string;
  recipe_id: string;
  storage_path: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
};

export type DatabaseRecipeTag = {
  id: string;
  recipe_id: string;
  tag: string;
};

export type DatabaseAppSetting = {
  id: string;
  key: string;
  value: string | null;
  type: string;
  updated_at: string;
};
