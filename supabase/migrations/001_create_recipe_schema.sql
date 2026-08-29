-- ============================================================================
-- OlaTiwa-Recipe Supabase Schema
-- Phase 1: Core recipe/content architecture
-- ============================================================================

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Recipes
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category_id uuid references public.categories(id),
  cuisine text,
  difficulty text check (difficulty in ('Easy','Medium','Hard')),
  preparation_time integer,
  cooking_time integer,
  total_time integer,
  servings integer,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  tips text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ingredients
create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  display_order integer not null default 0
);

-- Recipe steps
create table if not exists public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  step_number integer not null,
  instruction text not null,
  duration integer,
  optional_timer boolean not null default false,
  tips text,
  display_order integer not null default 0
);

-- Recipe images
create table if not exists public.recipe_images (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  is_primary boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- App settings
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  type text not null default 'text',
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_recipes_category on public.recipes(category_id);
create index if not exists idx_recipes_status on public.recipes(status);
create index if not exists idx_recipes_featured on public.recipes(featured) where featured = true;
create index if not exists idx_ingredients_recipe on public.ingredients(recipe_id);
create index if not exists idx_recipe_steps_recipe on public.recipe_steps(recipe_id);
create index if not exists idx_recipe_images_recipe on public.recipe_images(recipe_id);

-- Triggers for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_recipes_updated_at on public.recipes;
create trigger set_recipes_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();
