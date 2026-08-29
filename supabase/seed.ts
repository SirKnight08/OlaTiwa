export type SeedCategory = {
  name: string;
  slug: string;
  display_order: number;
};

export const seedCategories: SeedCategory[] = [
  { name: 'Nigerian', slug: 'nigerian', display_order: 1 },
  { name: 'African', slug: 'african', display_order: 2 },
  { name: 'East Asian', slug: 'east-asian', display_order: 3 },
  { name: 'South Asian', slug: 'south-asian', display_order: 4 },
  { name: 'Middle Eastern', slug: 'middle-eastern', display_order: 5 },
  { name: 'European', slug: 'european', display_order: 6 },
  { name: 'Latin American', slug: 'latin-american', display_order: 7 },
  { name: 'North American', slug: 'north-american', display_order: 8 },
  { name: 'Caribbean', slug: 'caribbean', display_order: 9 },
  { name: 'Oceanic', slug: 'oceanic', display_order: 10 },
];
