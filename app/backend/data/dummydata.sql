-- Sample data to get something visible
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
