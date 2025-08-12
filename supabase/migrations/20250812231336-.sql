-- Update analyses table to include image_paths as JSONB array and ensure proper indexing
ALTER TABLE public.analyses 
ADD COLUMN IF NOT EXISTS image_paths JSONB DEFAULT '[]'::jsonb;

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_analyses_status ON public.analyses(status);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);

-- Update RLS policies to ensure proper security
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can create their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.analyses;

-- Recreate RLS policies
CREATE POLICY "Users can view their own analyses" 
ON public.analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
ON public.analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
ON public.analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
ON public.analyses 
FOR DELETE 
USING (auth.uid() = user_id);