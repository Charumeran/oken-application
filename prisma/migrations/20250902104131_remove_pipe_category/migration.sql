-- Remove pipe category and adjust display order
-- First, delete any materials that might be associated with pipe category
DELETE FROM materials WHERE category_id IN (SELECT id FROM categories WHERE name = 'パイプ');

-- Delete the pipe category
DELETE FROM categories WHERE name = 'パイプ';

-- Update display order for remaining categories
UPDATE categories SET display_order = 1 WHERE name = '枠';
UPDATE categories SET display_order = 2 WHERE name = 'くさび';
UPDATE categories SET display_order = 3 WHERE name = 'シート';
UPDATE categories SET display_order = 4 WHERE name = 'その他';