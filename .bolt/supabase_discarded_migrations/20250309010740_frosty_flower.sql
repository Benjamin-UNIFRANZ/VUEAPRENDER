/*
  # Add file name update functionality

  1. Changes
    - Add trigger to ensure project_files have unique names within a project space
    - Add policy to allow users to update their own file names
*/

-- Add policy for updating file names
CREATE POLICY "Users can update their own file names"
ON project_files
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM project_spaces
    WHERE project_spaces.id = project_files.project_space_id
    AND project_spaces.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_spaces
    WHERE project_spaces.id = project_files.project_space_id
    AND project_spaces.user_id = auth.uid()
  )
);

-- Create function to check unique file names within a project space
CREATE OR REPLACE FUNCTION check_unique_file_name()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM project_files
    WHERE project_space_id = NEW.project_space_id
    AND name = NEW.name
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'File name must be unique within a project space';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for unique file names
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'ensure_unique_file_name'
  ) THEN
    CREATE TRIGGER ensure_unique_file_name
    BEFORE INSERT OR UPDATE ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION check_unique_file_name();
  END IF;
END $$;