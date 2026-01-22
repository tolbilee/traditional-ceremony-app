-- Add file_metadata column to applications table
-- This column stores original file names mapped to storage URLs
-- Format: JSONB object with { "storage_url": "original_filename.jpg" }

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS file_metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_file_metadata ON applications USING GIN (file_metadata);

-- Comment
COMMENT ON COLUMN applications.file_metadata IS 'Maps storage file URLs to original file names. Format: {"storage_url": "original_filename.jpg"}';
