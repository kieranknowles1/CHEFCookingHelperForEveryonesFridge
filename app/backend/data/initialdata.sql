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
    ('Water', 'ml', true, 1.0);

-- Source: https://annaolson.ca/baking-conversions/
INSERT INTO ingredient
    (name, preferredUnit, density)
VALUES
    ('Baking Powder', 'g', 1.0),
    ('Brown Sugar', 'g', 0.8),
    ('Butter', 'g', 0.9),
    ('Flour', 'g', 0.6),
    ('Ground Beef', 'g', 1.0),
    ('Milk', 'ml', 1.0),
    ('Nuts', 'g', 0.5),
    ('Oil', 'ml', 0.9),
    ('Sugar', 'g', 0.8),
    ('Vanilla', 'ml', 0.9);

INSERT INTO ingredient_alt_name
    (name, ingredient_id)
VALUES
    ('Egg', (SELECT id FROM ingredient WHERE name = 'Eggs')),
    ('Green Pepper', (SELECT id FROM ingredient WHERE name = 'Bell Pepper')),
    ('Margarine', (SELECT id FROM ingredient WHERE name = 'Butter')),
    ('Olive Oil', (SELECT id FROM ingredient WHERE name = 'Oil')),
    ('Onion', (SELECT id FROM ingredient WHERE name = 'Onions')),
    ('Red Bell Pepper', (SELECT id FROM ingredient WHERE name = 'Bell Pepper')),
    ('Red Pepper', (SELECT id FROM ingredient WHERE name = 'Bell Pepper')),
    ('White Sugar', (SELECT id FROM ingredient WHERE name = 'Sugar'));
