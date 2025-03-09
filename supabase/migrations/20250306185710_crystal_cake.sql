/*
  # Create projects table for C# code editor

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `code` (text, not null)
      - `created_at` (timestamptz, default: now())
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for authenticated users to:
      - Read their own projects
      - Create new projects
      - Update their own projects
*/

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own projects
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create projects
CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);