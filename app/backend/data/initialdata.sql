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
    ('Hamburger', 'whole'),
    ('Onions', 'whole'),
    ('Pepper', 'none'),
    ('Salt', 'none'),
    ('Tomatoes', 'whole');

INSERT INTO ingredient
    (name, preferredUnit, assumeUnlimited, density)
VALUES
    ('Boiling Water', 'ml', true, 1.0),
    ('Cold Water', 'ml', true, 1.0),
    ('Water', 'ml', true, 1.0);

-- Source: https://annaolson.ca/baking-conversions/
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
    ('Cheese', 'g', 0.4),
    ('Chicken', 'g', 0.5),
    ('Flour', 'g', 0.6),
    ('Ground Beef', 'g', 1.0),
    ('Milk', 'ml', 1.0),
    ('Mushrooms', 'g', 0.4),
    ('Nuts', 'g', 0.5),
    ('Oil', 'ml', 0.9),
    ('Potatoes', 'g', 0.9),
    ('Rice', 'g', 0.9),
    ('Sugar', 'g', 0.8),
    ('Vanilla', 'ml', 0.9),
    ('Vinegar', 'ml', 0.9);

INSERT INTO ingredient_alt_name
    (name, ingredient_id)
VALUES
    ('Black Pepper', (SELECT id FROM ingredient WHERE name = 'Pepper')),
    ('Carrot', (SELECT id FROM ingredient WHERE name = 'Carrots')),
    ('Cheddar Cheese', (SELECT id FROM ingredient WHERE name = 'Cheese')),
    ('Clove Garlic', (SELECT id FROM ingredient WHERE name = 'Garlic')),
    ('Egg Yolks', (SELECT id FROM ingredient WHERE name = 'Eggs')),
    ('Egg', (SELECT id FROM ingredient WHERE name = 'Eggs')),
    ('Freshly Ground Black Pepper', (SELECT id FROM ingredient WHERE name = 'Pepper')),
    ('Green Pepper', (SELECT id FROM ingredient WHERE name = 'Bell Pepper')),
    ('Margarine', (SELECT id FROM ingredient WHERE name = 'Butter')),
    ('Mozzarella Cheese', (SELECT id FROM ingredient WHERE name = 'Cheese')),
    ('Olive Oil', (SELECT id FROM ingredient WHERE name = 'Oil')),
    ('Onion', (SELECT id FROM ingredient WHERE name = 'Onions')),
    ('Red Bell Pepper', (SELECT id FROM ingredient WHERE name = 'Bell Pepper')),
    ('Red Pepper', (SELECT id FROM ingredient WHERE name = 'Bell Pepper')),
    ('Red Wine Vinegar', (SELECT id FROM ingredient WHERE name = 'Vinegar')),
    ('Tomato', (SELECT id FROM ingredient WHERE name = 'Tomatoes')),
    ('Unsalted Butter', (SELECT id FROM ingredient WHERE name = 'Butter')),
    ('White Sugar', (SELECT id FROM ingredient WHERE name = 'Sugar'));

INSERT INTO user
    (id, username)
VALUES
    (1, 'Bob');

INSERT INTO fridge
    (id, name, owner_id)
VALUES
    (1, 'Bobs Fridge', 1);

INSERT INTO fridge_ingredient
    (fridge_id, ingredient_id, amount)
VALUES
    (1, (SELECT id FROM ingredient WHERE name = 'Bananas'), 5);
