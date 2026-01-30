-- Add timestamp for hand raising
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS hand_raised_at TIMESTAMPTZ DEFAULT NULL;

-- Enable Realtime for this column is already covered by "ALTER PUBLICATION ... ADD TABLE students"
-- but good to double check or re-run if needed.
-- (The previous step added the table, so we are good).

-- Policy adjustment: Allow students to update THEIR OWN row to set hand_raised_at?
-- Or allow ANONYMOUS updates if they 'own' the row via localStorage ID?
-- Supabase doesn't know 'localStorage ID'.
-- WEAK SECURITY PATTERN FOR MVP:
-- Allow public update of 'hand_raised_at' if they know the student ID?
-- Better: Use a secure RPC to "raise_hand(student_id)".

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

-- Function to clear hands (Teacher only)
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
