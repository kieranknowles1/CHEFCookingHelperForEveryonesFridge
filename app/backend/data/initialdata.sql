INSERT INTO ingredient
    (name, preferredUnit)
VALUES
    ('Apples', 'whole'),
    ('Bananas', 'whole'),
    ('Bell Pepper', 'whole'),
    ('Carrots', 'whole'),
    ('Chicken Breasts', 'whole'),
    ('Eggs', 'whole'),
    ('Garlic', 'whole'),
    ('Green Pepper', 'whole'),
    ('Hamburger', 'whole'),
    ('Onions', 'whole'),
    ('Pepper', 'none'),
    ('Red Pepper', 'whole'),
    ('Salt', 'none'),
    ('Tomatoes', 'whole');

INSERT INTO ingredient
    (name, preferredUnit, assumeUnlimited, density)
VALUES
    ('Boiling Water', 'ml', true, 1.0),
    ('Cold Water', 'ml', true, 1.0),
    ('Water', 'ml', true, 1.0);

-- Sources:
-- https://annaolson.ca/baking-conversions/
-- https://www.cookitsimply.com/measurements/cups/chicken/
-- https://www.cookitsimply.com/measurements/cups/potatoes/
-- https://www.cookitsimply.com/measurements/cups/rice/
-- https://coolconversion.com/cooking-volume-weight/
INSERT INTO ingredient
    (name, preferredUnit, density)
VALUES
    ('Baking Powder', 'g', 0.9),
    ('Baking Soda', 'g', 0.9),
    ('Brown Sugar', 'g', 0.8),
    ('Butter', 'g', 0.9),
    ('Cheddar Cheese', 'g', 0.4),
    ('Cheese', 'g', 0.4),
    ('Chicken', 'g', 0.5),
    ('Cream Cheese', 'ml', 1.0),
    ('Flour', 'g', 0.6),
    ('Ground Beef', 'g', 1.0),
    ('Milk', 'ml', 1.0),
    ('Mozzarella Cheese', 'g', 0.4),
    ('Mushrooms', 'g', 0.4),
    ('Nuts', 'g', 0.5),
    ('Oil', 'ml', 0.9),
    ('Parmesan Cheese', 'g', 0.4),
    ('Potatoes', 'g', 0.9),
    ('Rice', 'g', 0.9),
    ('Sour Cream', 'ml', 1.0),
    ('Sugar', 'g', 0.8),
    ('Vanilla', 'ml', 0.9),
    ('Vinegar', 'ml', 0.9);

INSERT INTO ingredient_alt_name
    (name, ingredient_id)
VALUES
    ('Black Pepper', (SELECT id FROM ingredient WHERE name = 'Pepper')),
    ('Carrot', (SELECT id FROM ingredient WHERE name = 'Carrots')),
    ('Clove Garlic', (SELECT id FROM ingredient WHERE name = 'Garlic')),
    ('Egg Yolks', (SELECT id FROM ingredient WHERE name = 'Eggs')),
    ('Egg', (SELECT id FROM ingredient WHERE name = 'Eggs')),
    ('Freshly Ground Black Pepper', (SELECT id FROM ingredient WHERE name = 'Pepper')),
    ('Margarine', (SELECT id FROM ingredient WHERE name = 'Butter')),
    ('Olive Oil', (SELECT id FROM ingredient WHERE name = 'Oil')),
    ('Onion', (SELECT id FROM ingredient WHERE name = 'Onions')),
    ('Red Bell Pepper', (SELECT id FROM ingredient WHERE name = 'Red Pepper')),
    ('Red Wine Vinegar', (SELECT id FROM ingredient WHERE name = 'Vinegar')),
    ('Tomato', (SELECT id FROM ingredient WHERE name = 'Tomatoes')),
    ('Unsalted Butter', (SELECT id FROM ingredient WHERE name = 'Butter')),
    ('White Sugar', (SELECT id FROM ingredient WHERE name = 'Sugar'));

INSERT INTO ingredient_substitution_group
    (name)
VALUES
    ('Cheese'),
    ('Cream'),
    ('Peppers');

INSERT INTO ingredient_substitution_entry
    (group_id, ingredient_id)
VALUES
    ((SELECT id FROM ingredient_substitution_group WHERE name = 'Cheese'), (SELECT id FROM ingredient WHERE name = 'Cheddar Cheese')),
    ((SELECT id FROM ingredient_substitution_group WHERE name = 'Cheese'), (SELECT id FROM ingredient WHERE name = 'Cheese')),
    ((SELECT id FROM ingredient_substitution_group WHERE name = 'Cheese'), (SELECT id FROM ingredient WHERE name = 'Mozzarella Cheese')),
    -- Parmesan cheese intentionally omitted
    ((SELECT id FROM ingredient_substitution_group WHERE name = 'Cream'), (SELECT id FROM ingredient WHERE name = 'Cream Cheese')),
    ((SELECT id FROM ingredient_substitution_group WHERE name = 'Cream'), (SELECT id FROM ingredient WHERE name = 'Sour Cream')),
    ((SELECT id FROM ingredient_substitution_group WHERE name = 'Peppers'), (SELECT id FROM ingredient WHERE name = 'Bell Pepper')),
    ((SELECT id FROM ingredient_substitution_group WHERE name = 'Peppers'), (SELECT id FROM ingredient WHERE name = 'Green Pepper')),
    ((SELECT id FROM ingredient_substitution_group WHERE name = 'Peppers'), (SELECT id FROM ingredient WHERE name = 'Red Pepper'));

-- Embeddings are added in ./setup/index.ts as we can't call async functions from here
PRAGMA foreign_keys = OFF;
INSERT INTO meal_type
    (name)
VALUES
    ('Breakfast'),
    ('Lunch'),
    ('Dinner'),
    ('Snack'),
    ('Dessert');
-- We run foreign_key_check after setup to ensure that these are embedded for when we run the app
PRAGMA foreign_keys = ON;
