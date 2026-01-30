-- FIX: Allow public/students to read Class information if a code exists
-- This is required because the 'students' policy depends on reading the 'classes' table.
DROP POLICY IF EXISTS "Public classes read" ON classes;
CREATE POLICY "Public classes read" 
ON classes FOR SELECT 
USING (join_code IS NOT NULL);

-- Ensure Students table is readable by public if the class is open
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

-- Ensure Realtime is enabled for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE classes;
ALTER PUBLICATION supabase_realtime ADD TABLE students;
