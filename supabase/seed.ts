export type SeedCategory = {
  name: string;
  slug: string;
  display_order: number;
};

export const seedCategories: SeedCategory[] = [
  { name: 'East Asian Classics', slug: 'east-asian-classics', display_order: 1 },
  { name: 'South Asian Flavors', slug: 'south-asian-flavors', display_order: 2 },
  { name: 'Middle Eastern Favorites', slug: 'middle-eastern-favorites', display_order: 3 },
  { name: 'African Staples', slug: 'african-staples', display_order: 4 },
  { name: 'European Comforts', slug: 'european-comforts', display_order: 5 },
  { name: 'Latin American Bites', slug: 'latin-american-bites', display_order: 6 },
  { name: 'North American Classics', slug: 'north-american-classics', display_order: 7 },
  { name: 'Caribbean Flavors', slug: 'caribbean-flavors', display_order: 8 },
  { name: 'Oceanic & Southeast Asian', slug: 'oceanic-southeast-asian', display_order: 9 },
  { name: 'Global Sweet & Snack Combos', slug: 'global-sweet-snack-combos', display_order: 10 },
];
