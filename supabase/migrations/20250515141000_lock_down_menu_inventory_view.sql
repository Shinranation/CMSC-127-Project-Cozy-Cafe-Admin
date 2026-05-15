-- The menu_inventory view joins menu + inventory and exposes stock (available_units).
-- Without RLS, Supabase shows it as "UNRESTRICTED" — any role with SELECT could read stock via the REST API.
-- Admin inventory UI uses get_menu_for_pos() instead (admin-only SECURITY DEFINER RPC).
-- Revoke direct API access to the view from client roles; the definer RPC still reads base tables.

REVOKE ALL ON public.menu_inventory FROM PUBLIC;
REVOKE ALL ON public.menu_inventory FROM anon;
REVOKE ALL ON public.menu_inventory FROM authenticated;
