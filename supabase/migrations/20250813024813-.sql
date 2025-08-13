-- Update the Chest CT case to use existing images
UPDATE demo_cases 
SET image_paths = ARRAY['demo-images/benign.jpg', 'demo-images/benign1.jpg']
WHERE title = 'Chest CT – Suspected Pneumonia';