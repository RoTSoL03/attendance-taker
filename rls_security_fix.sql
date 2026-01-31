-- Enable RLS on tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 1. CLASSES TABLE POLICIES

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Public classes read" ON classes;
DROP POLICY IF EXISTS "Teachers update own classes" ON classes;
DROP POLICY IF EXISTS "Teachers insert own classes" ON classes;
DROP POLICY IF EXISTS "Teachers delete own classes" ON classes;
DROP POLICY IF EXISTS "Teacher View" ON classes;
DROP POLICY IF EXISTS "Student View" ON classes;

-- Teacher Policy (Authenticated): FULL ACCESS to OWN classes
CREATE POLICY "Teacher Access"
ON classes
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Student Policy (Anon): READ ONLY to classes with codes
CREATE POLICY "Student Access"
ON classes
FOR SELECT
TO anon
USING (join_code IS NOT NULL);


-- 2. STUDENTS TABLE POLICIES

-- Drop existing policies
DROP POLICY IF EXISTS "Public students read" ON students;
DROP POLICY IF EXISTS "Public students insert" ON students;

-- Teacher Policy (Authenticated): FULL ACCESS to students in OWN classes
CREATE POLICY "Teacher Student Access"
ON students
TO authenticated
USING (
  EXISTS (SELECT 1 FROM classes WHERE id = students.class_id AND user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM classes WHERE id = students.class_id AND user_id = auth.uid())
);

-- Student Policy (Anon): READ/INSERT to students in Open Classes
-- They need to see the list of students in the lobby (SELECT)
-- They need to add themselves (INSERT)
-- They might need to update their hand raise status (UPDATE) - via RPC usually, but RLS matters if direct update
CREATE POLICY "Student Lobby Access"
ON students
TO anon
USING (
  EXISTS (SELECT 1 FROM classes WHERE id = students.class_id AND join_code IS NOT NULL)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM classes WHERE id = students.class_id AND join_code IS NOT NULL)
);


-- 3. ATTENDANCE TABLE POLICIES (Assuming similar structure)
DROP POLICY IF EXISTS "Teacher Attendance Access" ON attendance;

CREATE POLICY "Teacher Attendance Access"
ON attendance
TO authenticated
USING (
  EXISTS (SELECT 1 FROM classes WHERE id = attendance.class_id AND user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM classes WHERE id = attendance.class_id AND user_id = auth.uid())
);

-- Ensure Realtime still works (Publication should be set)
-- ALTER PUBLICATION supabase_realtime ADD TABLE classes, students, attendance;
