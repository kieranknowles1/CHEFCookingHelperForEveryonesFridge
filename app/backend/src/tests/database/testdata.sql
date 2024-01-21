-- Data for testing the database
-- DO NOT USE IN PRODUCTION, THIS WILL DELETE ALL DATA

PRAGMA foreign_keys = OFF;
DELETE FROM ingredient;
DELETE FROM ingredient_tag;
DELETE FROM ingredient_alt_name;
DELETE FROM ingredient_substitution_group;
DELETE FROM ingredient_substitution_entry;
DELETE FROM recipe;
DELETE FROM recipe_ingredient;
DELETE FROM user;
DELETE FROM fridge;
DELETE FROM fridge_ingredient;
PRAGMA foreign_keys = ON;

-- Some dummy embedding data for recipe names, does not correspond to anything meaningful
INSERT INTO embedding
    (sentence, embedding)
VALUES
    ('A and B salad', zeroblob(128)),
    ('B and C pie', zeroblob(128));

INSERT INTO ingredient
    (id, name, preferredUnit, density)
VALUES
    (1, 'Apples', 'whole', 123),
    (2, 'Bananas', 'whole', 456),
    (3, 'Carrots', 'whole', 789);

INSERT INTO recipe
    (id, name, directions, link, meal_type_id)
VALUES
    (1, 'A and B salad', 'Put the A and B together.', 'https://example.com', 1),
    (2, 'B and C pie', 'Why not?', 'https://example.com', 2);

INSERT INTO recipe_ingredient
    (recipe_id, ingredient_id, amount, original_line)
VALUES
    (1, 1, 10, '10 Apples'),
    (1, 2, 5, '5 Bananas'),

    (2, 2, 10, '10 Bananas'),
    (2, 3, 5, '5 Carrots');

INSERT INTO barcode
    (code, ingredient_id, product_name, amount)
VALUES
    (12345, 1, 'The apples from the maths test', 1000);

INSERT INTO user
    (id, username)
VALUES
    (1, 'Testy McTestface');

INSERT INTO fridge
    (id, name, owner_id)
VALUES
    (1, 'The Test Fridge', 1);
