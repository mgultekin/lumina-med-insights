-- Add metadata columns to analyses table
ALTER TABLE public.analyses ADD COLUMN article_title TEXT;
ALTER TABLE public.analyses ADD COLUMN tone TEXT DEFAULT 'Academic';
ALTER TABLE public.analyses ADD COLUMN keywords JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.analyses ADD COLUMN citations JSONB DEFAULT '[]'::jsonb;