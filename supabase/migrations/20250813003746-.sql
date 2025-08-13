-- Create RPC function to sign image URLs
CREATE OR REPLACE FUNCTION public.sign_image(p_path TEXT, expires INTEGER DEFAULT 3600)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- Get signed URL from storage
  SELECT url INTO signed_url
  FROM storage.objects
  WHERE bucket_id = 'medical-images' AND name = p_path;
  
  -- If object exists, create signed URL
  IF signed_url IS NOT NULL THEN
    SELECT storage.create_signed_url('medical-images', p_path, expires) INTO signed_url;
    RETURN signed_url;
  END IF;
  
  RETURN NULL;
END;
$$;