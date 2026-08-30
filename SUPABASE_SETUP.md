# Supabase Database Setup Guide

## Prerequisites

- Supabase account (https://supabase.com)
- Node.js and npm installed

## Setup Steps

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign up/log in
2. Create a new project
3. Note your project URL and anon key

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local` (or `.env` for Expo):
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 3. Create Database Tables

There are two ways to set up the database:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of `supabase/migrations/001_create_recipe_schema.sql`
5. Paste it into the SQL editor
6. Click "Run"

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your_project_ref

# Apply migrations
supabase db push
```

### 4. Seed Initial Data

Run the seed scripts to insert the 10 categories and **201 recipes**:

```bash
npm run seed              # categories + recipes
npm run seed:categories
npm run seed:recipes
```

The recipe seeder imports the bundled dataset from `src/recipes.ts`, upserts by slug (id), and refreshes each recipe's ingredients, steps, images and tags on every run, so it is safe to re-run.

### 5. Enable Row Level Security (Optional)

For production apps, configure RLS policies:

1. Go to Authentication > Policies in Supabase dashboard
2. Create policies to restrict read/write access as needed

### 6. Install Dependencies

```bash
npm install
```

### 7. Start the App

```bash
npm start
```

## Database Schema

### Tables

- **recipes** - Main recipe data
  - id (PK): Recipe identifier
  - slug (UNIQUE): Stable identifier for repeatable seeding
  - title: Recipe name
  - description: Short description
  - category_id (FK): Links to categories
  - cuisine: Cuisine type
  - difficulty: Easy | Medium | Hard
  - preparation_time: Prep time in minutes
  - cooking_time: Cook time in minutes
  - total_time: Total time in minutes
  - servings: Number of servings
  - featured: Boolean flag for featured recipes
  - popular: Boolean flag for popular recipes
  - status: draft | published | archived
  - created_at: Timestamp
  - updated_at: Timestamp

- **ingredients** - Recipe ingredients
  - id (PK)
  - recipe_id (FK): Links to recipes
  - name: Ingredient name
  - quantity: Amount
  - unit: Unit of measurement
  - created_at

- **recipe_steps** - Cooking instructions
  - id (PK)
  - recipe_id (FK): Links to recipes
  - step_number: Order of steps
  - instruction: Step description
  - duration: Time in minutes (optional)
  - optional_timer: Boolean for timer
  - created_at

- **recipe_images** - Recipe images (URLs / storage paths)
  - id (PK)
  - recipe_id (FK): Links to recipes
  - storage_path: Image URL / storage path
  - is_primary: Marks the primary image
  - display_order
  - created_at

- **recipe_tags** - Recipe tags (for search)
  - id (PK)
  - recipe_id (FK): Links to recipes
  - tag: Tag text
  - created_at

### Indexes

Full-text search indexes are created for:
- Recipe title, description, category, cuisine
- Ingredient names
- Tags

## Common Issues

### "Supabase credentials not configured"

Make sure your `.env.local` file has the correct `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` values.

### Seed script fails

- Check that all database tables are created
- Verify your Supabase credentials are correct
- Ensure the recipes data is valid JSON

### Slow queries

- Check that indexes are created (see step 3)
- Use the Supabase dashboard to analyze query performance

## API Reference

See `src/services/recipeService.ts` for available functions:

- `fetchAllRecipes()` - Get all recipes
- `fetchRecipeById(id)` - Get a specific recipe
- `fetchFeaturedRecipes()` - Get featured recipes
- `fetchPopularRecipes()` - Get popular recipes
- `fetchRecipesByCategory(category)` - Filter by category
- `searchRecipes(query)` - Full-text search
- `fetchCategories()` - Get all categories
- `createRecipe(recipe)` - Add new recipe
- `updateRecipe(id, updates)` - Update recipe
- `deleteRecipe(id)` - Delete recipe

## Data Migration

The 201 recipes from `src/recipes.ts` are seeded via `supabase/seed-recipes.ts` (categories come from `supabase/seed.ts` / `seed-categories.ts`).

To migrate:
1. Ensure all tables are created
2. Run the seed scripts (step 4 above)
3. Update screens to use `AppContext.recipes` instead of importing from `src/data/recipes.ts`

## Validation

All recipe data is validated using Zod schemas in `src/lib/validation.ts` before being saved to the database.

## Next Steps

1. Remove the old `src/data/recipes.ts` file (no longer needed)
2. Update screens to fetch recipes from `AppContext`
3. Update search/filter functionality to use `RecipeService`
4. Add real-time subscriptions if needed (Supabase supports real-time updates)
