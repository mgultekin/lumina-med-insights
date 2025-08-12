-- Add model and task columns to analyses table
ALTER TABLE public.analyses 
ADD COLUMN model TEXT DEFAULT 'gpt-4o-mini-vision',
ADD COLUMN task TEXT;