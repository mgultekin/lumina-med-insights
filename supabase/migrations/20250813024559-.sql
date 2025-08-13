-- Update demo_cases table with correct image paths that match existing files in storage
UPDATE demo_cases 
SET image_paths = ARRAY['demo-images/benign.jpg', 'demo-images/benign1.jpg']
WHERE title = 'Brain MRI – Possible Glioma';

UPDATE demo_cases 
SET image_paths = ARRAY['demo-images/benign.jpg']
WHERE title = 'Chest X-Ray – Pneumonia Detection';