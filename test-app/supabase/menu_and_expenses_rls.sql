-- Run in Supabase SQL Editor after creating menu / expenses tables.
-- Uses the existing public.is_admin(auth.uid()) helper from admin_rls_setup.sql.

alter table public.menu enable row level security;
alter table public.expenses enable row level security;
alter table public.menu_ingredients enable row level security;

-- Menu: admins can add/edit/delete menu items; signed-in users can read them.
drop policy if exists "menu_select_authenticated" on public.menu;
create policy "menu_select_authenticated"
on public.menu
for select
to authenticated
using (true);

drop policy if exists "menu_modify_admin_only" on public.menu;
create policy "menu_modify_admin_only"
on public.menu
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Expenses: admins can add/edit/delete expense rows; signed-in users can read them.
drop policy if exists "expenses_select_authenticated" on public.expenses;
create policy "expenses_select_authenticated"
on public.expenses
for select
to authenticated
using (true);

drop policy if exists "expenses_modify_admin_only" on public.expenses;
create policy "expenses_modify_admin_only"
on public.expenses
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- Menu ingredients: admins manage recipe links; signed-in users can read them.
drop policy if exists "menu_ingredients_select_authenticated" on public.menu_ingredients;
create policy "menu_ingredients_select_authenticated"
on public.menu_ingredients
for select
to authenticated
using (true);

drop policy if exists "menu_ingredients_modify_admin_only" on public.menu_ingredients;
create policy "menu_ingredients_modify_admin_only"
on public.menu_ingredients
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
