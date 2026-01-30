-- SAFE FIX FOR ALL PERMISSIONS AND FUNCTIONS (No Realtime commands)

-- 1. Ensure Columns Exist
ALTER TABLE classes ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS hand_raised_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Join Function (Connectivity)
CREATE OR REPLACE FUNCTION get_class_by_code(code_input TEXT)
RETURNS TABLE (id UUID, name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name
  FROM classes c
  WHERE UPPER(c.join_code) = UPPER(code_input);
END;
$$;
GRANT EXECUTE ON FUNCTION get_class_by_code TO anon, authenticated, service_role;

-- 3. Raise Hand Function
CREATE OR REPLACE FUNCTION raise_hand(s_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE students 
  SET hand_raised_at = NOW() 
  WHERE id = s_id;
END;
$$;
GRANT EXECUTE ON FUNCTION raise_hand TO anon, authenticated, service_role;

-- 4. Lower Hand Function
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

-- 5. Reset All Hands (Teacher)
CREATE OR REPLACE FUNCTION reset_hands(c_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE students 
  SET hand_raised_at = NULL 
  WHERE class_id = c_id;
END;
$$;
GRANT EXECUTE ON FUNCTION reset_hands TO authenticated, service_role;

-- 6. Fix RLS for Student List (Empty List Bug)
DROP POLICY IF EXISTS "Public classes read" ON classes;
CREATE POLICY "Public classes read" ON classes FOR SELECT USING (join_code IS NOT NULL);

DROP POLICY IF EXISTS "Public students read" ON students;
CREATE POLICY "Public students read" ON students FOR SELECT USING (
  EXISTS (SELECT 1 FROM classes WHERE id = students.class_id AND join_code IS NOT NULL)
);

DROP POLICY IF EXISTS "Teachers update own classes" ON classes;
CREATE POLICY "Teachers update own classes" ON classes FOR UPDATE USING (auth.uid() = user_id);

-- 7. Realtime Enablement (REMOVED due to error 'already member')
-- We assume this has been done or failed because it was already done.
-- Proceed without altering publication.
