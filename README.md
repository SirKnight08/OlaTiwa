# OlaTiwa-Recipe 🍳

A polished, offline-tolerant Android recipe application built with **Expo / React Native**, backed by **Supabase** with a local fallback — so it always works, even offline.

**Package:** `com.arike.recipe` · **Branding:** OlaTiwa-Recipe

---

## ✨ Features

- **201 bundled recipes** across 10 categories (East Asian, South Asian, Middle Eastern, African, European, Latin American, North American, Caribbean, Oceanic, Sweet & Snack)
- Remote-first data loading: Supabase when available → cached → bundled local fallback
- **Search** across titles, categories, cuisine, descriptions, ingredients and tags
- **Category browsing** and filtering
- **Recipe detail** with ingredient quantity scaling, prep/cook/total times, difficulty, servings, images and tips
- **Cooking Mode** with a step-by-step progress bar, countdown timer and text-to-speech prompts
- **Favorites** and **Recently Viewed**, persisted locally (AsyncStorage)
- **Shopping List** — check off / remove / clear items, and add a recipe's ingredients in one tap
- Animated **intro screen**
- **Light / Dark / System** theming that persists
- Slide-out **menu drawer** for navigation
- Lightweight, theme-aware **icon system** (no competing icon vendors)

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 57 (React Native 0.86, React 19) |
| Language | TypeScript (strict) |
| Navigation | React Navigation (bottom tabs + native stack) |
| Storage | AsyncStorage (favorites, lists, cache, theme) |
| Backend | Supabase (`@supabase/supabase-js`) — optional, remote-first |
| Validation | Zod |
| Extras | `expo-speech` (cooking mode voice) |

## 📁 Project Structure

```
├── App.tsx                      # Root: providers + intro gate
├── src/
│   ├── navigation/AppNavigator.tsx
│   ├── screens/                 # Home, Categories, Search, Favorites,
│   │                            #   ShoppingList, RecipeDetail, CookingMode, Intro
│   ├── components/Icon.tsx
│   ├── theme/                   # ThemeContext, MenuContext, themeStorage
│   ├── data/recipes.ts          # (legacy local data)
│   ├── services/recipeService.ts# Supabase data access + mapping
│   ├── config/                  # supabase client, database.types
│   ├── lib/validation.ts        # Zod schemas
│   ├── storage/storage.ts       # AsyncStorage + remote-first cache/fallback
│   └── AppContext.tsx           # global state (recipes, favorites, lists)
├── supabase/
│   ├── migrations/001_create_recipe_schema.sql
│   ├── seed.ts                  # category definitions
│   ├── seed-categories.ts       # category seeder
│   └── seed-recipes.ts          # 201-recipe seeder (upsert by slug)
├── .env.example
└── eas.json                     # EAS build profiles (incl. APK)
```

## 🚀 Getting Started

```bash
npm install
npm start          # then press 'a' for Android / scan QR in Expo Go
npm run type-check # TypeScript validation
```

## 🗄️ Supabase (optional backend)

The app works fully offline with bundled recipes. To enable the cloud database:

1. Create a Supabase project and copy your URL + **anon** key into `.env` (see `.env.example`).
2. Run the migration SQL (`supabase/migrations/001_create_recipe_schema.sql`) in the **Supabase SQL Editor**.
3. Seed the data:
   ```bash
   npm run seed              # categories + recipes
   # or individually:
   npm run seed:categories
   npm run seed:recipes
   ```

> ⚠️ **Status:** the migration has **not** yet been applied to the live Supabase project, so the remote tables do not exist yet. The app currently uses the bundled local dataset via the graceful fallback.

When remote data is available, the app loads it first and falls back to cache then bundled data automatically.

## 📦 Building an APK

```bash
eas build --platform android --profile preview --local   # installable APK
eas build --platform android                             # Play-ready AAB (auto-increment)
```

Package ID remains `com.arike.recipe`.

## 🔒 Security Notes

- Only the publishable **anon** key is ever bundled in the client.
- `service_role` keys must **never** be placed in the app or committed.
- `.env` and all secret files are git-ignored; `.env.example` holds placeholders only.

