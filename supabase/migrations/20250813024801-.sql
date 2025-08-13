-- Fix the sign_image function to use the correct storage API
CREATE OR REPLACE FUNCTION public.sign_image(p_path text, expires integer DEFAULT 3600)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  signed_url TEXT;
  bucket_name TEXT;
BEGIN
  -- Determine which bucket to use based on the path
  IF p_path LIKE 'demo-images/%' THEN
    bucket_name := 'demo-images';
  ELSE
    bucket_name := 'medical-images';
  END IF;
  
  -- Check if the object exists in the determined bucket
  IF EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = bucket_name AND name = p_path
  ) THEN
    -- Create signed URL using the correct storage function
    SELECT storage.sign(bucket_name, p_path, expires) INTO signed_url;
    RETURN signed_url;
  END IF;
  
  RETURN NULL;
END;
$function$;