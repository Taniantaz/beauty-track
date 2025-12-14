-- Create procedures table
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('face', 'skin', 'body', 'hair', 'makeup', 'brows', 'lashes', 'nails', 'tan')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  clinic TEXT,
  cost NUMERIC(10, 2),
  notes TEXT,
  product_brand TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('before', 'after')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL UNIQUE REFERENCES procedures(id) ON DELETE CASCADE,
  interval TEXT NOT NULL CHECK (interval IN ('30days', '90days', '6months', '1year', 'custom')),
  custom_days INTEGER,
  next_date TIMESTAMP WITH TIME ZONE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_procedures_user_id ON procedures(user_id);
CREATE INDEX IF NOT EXISTS idx_procedures_date ON procedures(date DESC);
CREATE INDEX IF NOT EXISTS idx_photos_procedure_id ON photos(procedure_id);
CREATE INDEX IF NOT EXISTS idx_reminders_procedure_id ON reminders(procedure_id);
CREATE INDEX IF NOT EXISTS idx_reminders_next_date ON reminders(next_date) WHERE enabled = true;

-- Enable Row Level Security
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for procedures
CREATE POLICY "Users can view their own procedures"
  ON procedures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own procedures"
  ON procedures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own procedures"
  ON procedures FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own procedures"
  ON procedures FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for photos
CREATE POLICY "Users can view photos of their own procedures"
  ON photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = photos.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their own procedures"
  ON photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = photos.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos of their own procedures"
  ON photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = photos.procedure_id
      AND procedures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = photos.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of their own procedures"
  ON photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = photos.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

-- RLS Policies for reminders
CREATE POLICY "Users can view reminders of their own procedures"
  ON reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = reminders.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reminders for their own procedures"
  ON reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = reminders.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reminders of their own procedures"
  ON reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = reminders.procedure_id
      AND procedures.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = reminders.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reminders of their own procedures"
  ON reminders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = reminders.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_procedures_updated_at
  BEFORE UPDATE ON procedures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

