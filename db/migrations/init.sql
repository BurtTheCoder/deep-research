-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  query TEXT NOT NULL,
  content TEXT,
  status TEXT NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Create index for faster sorting by created_at
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at DESC);
