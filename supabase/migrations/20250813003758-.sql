-- Fix security issues for sign_image function
CREATE OR REPLACE FUNCTION public.sign_image(p_path TEXT, expires INTEGER DEFAULT 3600)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- Check if the object exists in the medical-images bucket
  IF EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = 'medical-images' AND name = p_path
  ) THEN
    -- Create signed URL using storage API
    SELECT storage.create_signed_url('medical-images', p_path, expires) INTO signed_url;
    RETURN signed_url;
  END IF;
  
  RETURN NULL;
END;
$$;