-- Allow students to lower their hand
CREATE OR REPLACE FUNCTION lower_hand(s_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE students 
  SET hand_raised_at = NULL 
  WHERE id = s_id;
END;
$$;

GRANT EXECUTE ON FUNCTION lower_hand TO anon, authenticated, service_role;
