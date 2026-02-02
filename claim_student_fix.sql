-- 1. Add taken_at column
ALTER TABLE students ADD COLUMN IF NOT EXISTS taken_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Claim Student Function (Atomic)
CREATE OR REPLACE FUNCTION claim_student(s_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS to ensure we can check/update regardless of specific row policies
AS $$
DECLARE
  is_taken BOOLEAN;
BEGIN
  -- Attempt to update only if taken_at is NULL
  UPDATE students 
  SET taken_at = NOW() 
  WHERE id = s_id AND taken_at IS NULL;
  
  -- Check if a row was actually updated
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION claim_student TO anon, authenticated, service_role;


-- 3. Release Student Function
CREATE OR REPLACE FUNCTION release_student(s_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE students 
  SET taken_at = NULL 
  WHERE id = s_id;
END;
$$;

GRANT EXECUTE ON FUNCTION release_student TO anon, authenticated, service_role;
