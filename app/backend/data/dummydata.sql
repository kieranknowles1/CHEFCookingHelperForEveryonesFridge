-- Sample data to get something visible in the app
INSERT INTO user
    (id, username)
VALUES
    (1, 'Alice'),
    (2, 'Bob');

INSERT INTO user_banned_tag
    (user_id, tag_id)
VALUES
    (1, (SELECT id FROM tag WHERE name = 'Meat'));

INSERT INTO user_banned_ingredient
    (user_id, ingredient_id)
VALUES
    (2, (SELECT id FROM ingredient WHERE name = 'Mushrooms'));

INSERT INTO fridge
    (id, name, owner_id)
VALUES
    (1, 'Alice Fridge', 1),
    (2, 'Bobs Fridge', 2),
    (3, 'Shared Fridge', 1);

INSERT INTO fridge_ingredient
    (fridge_id, ingredient_id, amount)
VALUES
    (1, (SELECT id FROM ingredient WHERE name = 'Bananas'), 1),
    (1, (SELECT id FROM ingredient WHERE name = 'Carrots'), 2),
    (1, (SELECT id FROM ingredient WHERE name = 'Green Pepper'), 4),
    (1, (SELECT id FROM ingredient WHERE name = 'Red Pepper'), 8),
    (1, (SELECT id FROM ingredient WHERE name = 'Milk'), 1000);
