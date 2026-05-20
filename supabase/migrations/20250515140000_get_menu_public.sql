-- Public read-only menu for Customer page (anon + authenticated). No admin check.
-- Payload intentionally omits stock quantities and units (guest-safe). Run this migration once.
CREATE OR REPLACE FUNCTION public.get_menu_public()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'item_id', m.item_id,
        'name', m.name,
        'description', m.description,
        'price', m.price,
        'category', m.category
      )
      ORDER BY m.category, m.name
    ),
    '[]'::jsonb
  )
  INTO v_result
  FROM public.menu m
  JOIN public.inventory i ON i.ingredient_id = m.inventory_ingredient_id;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_menu_public() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_menu_public() TO anon;
GRANT EXECUTE ON FUNCTION public.get_menu_public() TO authenticated;
