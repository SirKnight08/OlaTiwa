# OlaTiwa-Recipe - Quick Start Guide

## ✅ App Status: READY FOR ANDROID TESTING

Your Arike Recipe app is **fully functional** and ready to install on an Android device for testing!

### What's Included
- ✅ 201 recipes across 10 cuisines (East Asian, South Asian, Middle Eastern, African, European, Latin American, North American, Caribbean, Oceanic, Sweet & Snack)
- ✅ 5 main navigation tabs (Home, Categories, Search, Favorites, Shopping List)
- ✅ Recipe details with ingredient scaling
- ✅ Cooking mode with timer and text-to-speech
- ✅ Shopping list management
- ✅ Favorites persistence with AsyncStorage
- ✅ Full TypeScript support
- ✅ Beautiful orange/cream theme
- ✅ Android-optimized (adaptive icons, all assets included)

### Installation & Testing on Android

#### Option 1: Physical Android Phone (Recommended)
```bash
# Install Expo CLI globally (if not already installed)
npm install -g expo

# Navigate to project directory
cd /Users/olaola/Desktop/github/arike-recipe

# Start Expo development server
npm start

# When the terminal shows the Expo menu, press 'a' for Android
# A QR code will appear - scan it with your Android phone using Expo Go app
```

#### Option 2: Android Emulator
```bash
# Make sure Android emulator is running first

npm start
# Press 'a' when prompt appears
```

### Features to Test
- **Home Screen**: Featured and popular recipes
- **Categories Tab**: Browse by cuisine type
- **Search Tab**: Search recipes by title, ingredients, or cuisine
- **Recipe Details**: View ingredients, steps, timing, scale servings
- **Cooking Mode**: Step-by-step with timer and voice announcements
- **Favorites**: Star recipes to save them
- **Shopping List**: Add ingredients from recipes or manually

### Architecture

```
arike-recipe/
├── App.tsx                          # Root component
├── src/
│   ├── AppContext.tsx              # Global state management (recipes, favorites, shopping list)
│   ├── types.ts                    # TypeScript type definitions
│   ├── theme.ts                    # Design system (colors, spacing, typography)
│   ├── data/recipes.ts             # (legacy local data — superseded by src/recipes.ts)
│   ├── storage/storage.ts          # Data access layer (AsyncStorage + local recipes)
│   ├── navigation/
│   │   └── AppNavigator.tsx        # Navigation structure (5 tabs + 2 modals)
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Featured & popular recipes
│   │   ├── CategoriesScreen.tsx    # Browse by category
│   │   ├── SearchScreen.tsx        # Full-text search
│   │   ├── RecipeDetailScreen.tsx  # Recipe details & ingredient scaling
│   │   ├── FavoritesScreen.tsx     # Saved recipes
│   │   ├── ShoppingListScreen.tsx  # Shopping list management
│   │   └── CookingModeScreen.tsx   # Step-by-step with timer & TTS
│   └── components/                 # Reusable components (Cards, etc.)
├── assets/                         # Android icons and app images
├── app.json                        # Expo config (Android: package "com.arike.recipe")
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript config
```

### Data Flow
1. **App loads** → AppProvider initializes
2. **loadRecipes()** → Remote-first: fetches from Supabase, falls back to AsyncStorage cache, then the bundled 201 recipes in `src/recipes.ts`
3. **loadCategories()** → Gets categories from same data
4. **AsyncStorage** → Loads user preferences (favorites, shopping list, recently viewed)
5. **Screens render** → All components use AppContext for data

### Supabase Backend (already integrated)

The app is **remote-first**: it tries Supabase, falls back to a local AsyncStorage cache, then the bundled 201 recipes — so it works offline.

To seed/configure the backend:

1. Create a project at https://supabase.com
2. Put your URL + **anon** key in `.env` (see `.env.example`):
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Run the migration SQL (`supabase/migrations/001_create_recipe_schema.sql`) in the Supabase SQL Editor
4. Seed the data: `npm run seed` (categories + 201 recipes)

Until the migration is applied (it isn't yet), the app keeps working from the bundled recipes.

### Troubleshooting

**Issue: App won't start**
```bash
# Clear cache
rm -rf node_modules .expo .next

# Reinstall
npm install

# Try again
npm start
```

**Issue: "Module not found" errors**
```bash
# TypeScript compilation check
npm run type-check

# This should show 0 errors
```

**Issue: Android app doesn't appear after scanning QR code**
- Make sure you have Expo Go app installed on Android phone
- Check phone and computer are on same WiFi network
- Try `npm start -- --tunnel` for internet connectivity

### Build for Production (Later)
When ready to submit to Google Play Store:
```bash
# Build APK
eas build --platform android --local

# Build AAB (Google Play)
eas build --platform android
```

### Support

All 201 recipes have:
- Full ingredients with quantities
- Step-by-step cooking instructions
- Preparation and cooking times
- Difficulty level (Easy/Medium/Hard)
- Cuisine type and category
- Serving size with scaling
- Recipe images from Unsplash

---

**Status**: ✅ Production Ready for MVP Testing  
**Last Updated**: January 2025  
**Ready to Install**: YES - on Android device/emulator
