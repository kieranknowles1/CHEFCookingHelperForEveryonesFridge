-- Sample data to get something visible in the app
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
    (1, (SELECT id FROM ingredient WHERE name = 'Bananas'), 1),
    (1, (SELECT id FROM ingredient WHERE name = 'Carrots'), 2),
    (1, (SELECT id FROM ingredient WHERE name = 'Green Pepper'), 4),
    (1, (SELECT id FROM ingredient WHERE name = 'Red Pepper'), 8),
    (1, (SELECT id FROM ingredient WHERE name = 'Milk'), 1000);
