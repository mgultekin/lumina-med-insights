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