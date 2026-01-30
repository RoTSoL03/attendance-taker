-- 1. Ensure the join_code column exists and is unique
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;

-- 2. Create a specific function for students to join using the code
-- This bypasses RLS (Security Definer) so unauthenticated users can look up the class
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

-- 3. Grant access to this function for everyone (including students)
GRANT EXECUTE ON FUNCTION get_class_by_code TO anon, authenticated, service_role;

-- 4. Allow students (public) to view the student list for a class
-- This is required for the Lobby to show "Who are you?"
-- We only allow reading students if the class has a join_code (i.e., is active)
DROP POLICY IF EXISTS "Public students read" ON students;
CREATE POLICY "Public students read" 
ON students FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM classes 
    WHERE id = students.class_id 
    AND join_code IS NOT NULL
  )
);

-- 5. Ensure Teachers can UPDATE their own classes (Fixes 406/Null issue potentially)
DROP POLICY IF EXISTS "Teachers update own classes" ON classes;
CREATE POLICY "Teachers update own classes" 
ON classes FOR UPDATE 
USING (auth.uid() = user_id);
