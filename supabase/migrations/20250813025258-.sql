-- Fix the sign_image function to properly handle path matching
CREATE OR REPLACE FUNCTION public.sign_image(p_path text, expires integer DEFAULT 3600)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  signed_url TEXT;
  bucket_name TEXT;
  object_name TEXT;
BEGIN
  -- Determine which bucket to use based on the path
  IF p_path LIKE 'demo-images/%' THEN
    bucket_name := 'demo-images';
    -- Extract just the filename from the full path
    object_name := substring(p_path from 'demo-images/(.*)');
  ELSE
    bucket_name := 'medical-images';
    object_name := p_path;
  END IF;
  
  -- Check if the object exists in the determined bucket
  IF EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = bucket_name AND name = object_name
  ) THEN
    -- Create signed URL using the correct storage function
    SELECT storage.sign(bucket_name, object_name, expires) INTO signed_url;
    RETURN signed_url;
  END IF;
  
  RETURN NULL;
END;
$function$

-- Update demo cases to only use existing image
UPDATE demo_cases 
SET image_paths = ARRAY['demo-images/benign.jpg']
WHERE title = 'Chest CT – Suspected Pneumonia';

UPDATE demo_cases 
SET image_paths = ARRAY['demo-images/benign.jpg']
WHERE title = 'Brain MRI – Tumor Detection';

UPDATE demo_cases 
SET image_paths = ARRAY['demo-images/benign.jpg']  
WHERE title = 'Abdominal CT – Liver Lesion';