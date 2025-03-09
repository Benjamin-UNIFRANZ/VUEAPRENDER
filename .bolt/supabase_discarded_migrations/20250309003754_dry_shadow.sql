/*
  # Add project spaces and files structure

  1. New Tables
    - `project_spaces`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `user_id` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `short_id` (varchar(6), unique)

    - `project_files`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `code` (text, required)
      - `project_space_id` (uuid, foreign key to project_spaces)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own spaces and files
*/

-- Create project_spaces table
CREATE TABLE IF NOT EXISTS project_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  short_id varchar(6) UNIQUE
);

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  project_space_id uuid REFERENCES project_spaces(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE project_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Policies for project_spaces
CREATE POLICY "Users can create their own project spaces"
  ON project_spaces
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own project spaces"
  ON project_spaces
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own project spaces"
  ON project_spaces
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project spaces"
  ON project_spaces
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for project_files
CREATE POLICY "Users can create files in their project spaces"
  ON project_files
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM project_spaces
    WHERE id = project_space_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can view files in their project spaces"
  ON project_files
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM project_spaces
    WHERE id = project_space_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update files in their project spaces"
  ON project_files
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM project_spaces
    WHERE id = project_space_id
    AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM project_spaces
    WHERE id = project_space_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete files in their project spaces"
  ON project_files
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM project_spaces
    WHERE id = project_space_id
    AND user_id = auth.uid()
  ));