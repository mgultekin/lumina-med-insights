-- Remove the problematic sign_image function since demo-images bucket is public
DROP FUNCTION IF EXISTS public.sign_image(text, integer);