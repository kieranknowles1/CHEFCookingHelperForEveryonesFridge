INSERT INTO ingredient
    (name, preferredUnit)
VALUES
    ('Apples', 'whole'),
    ('Bananas', 'whole'),
    ('Bell Pepper', 'whole'),
    ('Carrots', 'whole'),
    ('Chicken Breasts', 'whole'),
    ('Eggs', 'whole'),
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
    ('Brown Sugar', 'g', 0.8),
    ('Butter', 'g', 0.9),
    ('Flour', 'g', 0.6),
    ('Ground Beef', 'g', 1.0),
    ('Milk', 'ml', 1.0),
    ('Sugar', 'g', 0.8);

INSERT INTO ingredient_alt_name
    (name, ingredient_id)
VALUES
    ('Egg', (SELECT id FROM ingredient WHERE name = 'Eggs')),
    ('Margarine', (SELECT id FROM ingredient WHERE name = 'Butter')),
    ('Onion', (SELECT id FROM ingredient WHERE name = 'Onions'));
