-- Update the sign_image function to handle both medical-images and demo-images buckets
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
    -- Create signed URL using storage API
    SELECT storage.create_signed_url(bucket_name, p_path, expires) INTO signed_url;
    RETURN signed_url;
  END IF;
  
  RETURN NULL;
END;
$function$

-- Update demo_cases table with correct image paths that match existing files in storage
UPDATE demo_cases 
SET image_paths = ARRAY['demo-images/benign.jpg', 'demo-images/benign1.jpg']
WHERE title = 'Brain MRI – Possible Glioma';

UPDATE demo_cases 
SET image_paths = ARRAY['demo-images/benign.jpg']
WHERE title = 'Chest X-Ray – Pneumonia Detection';