-- ============================================================================
-- OlaTiwa-Recipe Row-Level Security
-- Phase 2: RLS + admin authorization
--
-- Model:
--   * Everyone (anon) can SELECT published recipes + active categories.
--   * Only authenticated admins can create/update/delete content.
--   * A user is an admin when their JWT app_metadata role == 'admin'.
--     (Set this in Supabase Dashboard: Authentication > Users > edit user
--      > app_metadata > { "role": "admin" })
-- The database itself enforces these rules — hiding buttons in the UI is not
-- enough. This file is additive/safe to run after migration 001.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- is_admin(): returns true when auth.jwt() app_metadata.role == 'admin'
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on every content table (safe: already enabled => no-op)
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.recipe_images enable row level security;
alter table public.recipe_tags enable row level security;
alter table public.app_settings enable row level security;

-- ---------------------------------------------------------------------------
-- CATEGORIES
--   public: read all categories
--   admin:  insert/update/delete
-- ---------------------------------------------------------------------------
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert"
  on public.categories for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update"
  on public.categories for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- RECIPES
--   public: read only published recipes
--   admin:  full CRUD on recipes
-- ---------------------------------------------------------------------------
drop policy if exists "recipes_public_read" on public.recipes;
create policy "recipes_public_read"
  on public.recipes for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "recipes_admin_insert" on public.recipes;
create policy "recipes_admin_insert"
  on public.recipes for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "recipes_admin_update" on public.recipes;
create policy "recipes_admin_update"
  on public.recipes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "recipes_admin_delete" on public.recipes;
create policy "recipes_admin_delete"
  on public.recipes for delete
  to authenticated
  using (public.is_admin());
-- ---------------------------------------------------------------------------
-- INGREDIENTS / STEPS / IMAGES / TAGS
--   public: read only children of published recipes
--   admin:  full CRUD
-- ---------------------------------------------------------------------------
drop policy if exists "ingredients_public_read" on public.ingredients;
create policy "ingredients_public_read"
  on public.ingredients for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.status = 'published'
    )
  );

drop policy if exists "ingredients_admin_write" on public.ingredients;
create policy "ingredients_admin_write"
  on public.ingredients for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "ingredients_admin_update" on public.ingredients;
create policy "ingredients_admin_update"
  on public.ingredients for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "ingredients_admin_delete" on public.ingredients;
create policy "ingredients_admin_delete"
  on public.ingredients for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "recipe_steps_public_read" on public.recipe_steps;
create policy "recipe_steps_public_read"
  on public.recipe_steps for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.status = 'published'
    )
  );

drop policy if exists "recipe_steps_admin_write" on public.recipe_steps;
create policy "recipe_steps_admin_write"
  on public.recipe_steps for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "recipe_steps_admin_update" on public.recipe_steps;
create policy "recipe_steps_admin_update"
  on public.recipe_steps for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "recipe_steps_admin_delete" on public.recipe_steps;
create policy "recipe_steps_admin_delete"
  on public.recipe_steps for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "recipe_images_public_read" on public.recipe_images;
create policy "recipe_images_public_read"
  on public.recipe_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.status = 'published'
    )
  );

drop policy if exists "recipe_images_admin_write" on public.recipe_images;
create policy "recipe_images_admin_write"
  on public.recipe_images for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "recipe_images_admin_update" on public.recipe_images;
create policy "recipe_images_admin_update"
  on public.recipe_images for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "recipe_images_admin_delete" on public.recipe_images;
create policy "recipe_images_admin_delete"
  on public.recipe_images for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "recipe_tags_public_read" on public.recipe_tags;
create policy "recipe_tags_public_read"
  on public.recipe_tags for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.status = 'published'
    )
  );

drop policy if exists "recipe_tags_admin_write" on public.recipe_tags;
create policy "recipe_tags_admin_write"
  on public.recipe_tags for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "recipe_tags_admin_update" on public.recipe_tags;
create policy "recipe_tags_admin_update"
  on public.recipe_tags for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "recipe_tags_admin_delete" on public.recipe_tags;
create policy "recipe_tags_admin_delete"
  on public.recipe_tags for delete
  to authenticated
  using (public.is_admin());