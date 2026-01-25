-- Add deleted_at column to applications table for soft delete functionality
-- This allows applications to be moved to trash instead of being permanently deleted

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance when filtering deleted items
CREATE INDEX IF NOT EXISTS idx_applications_deleted_at ON applications(deleted_at);

-- Comment
COMMENT ON COLUMN applications.deleted_at IS 'Timestamp when the application was moved to trash. NULL means the application is active.';
