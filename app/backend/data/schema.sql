PRAGMA foreign_keys = ON;

PRAGMA user_version = 1;

DROP TABLE IF EXISTS recipe_ingredient;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS recipe;

CREATE TABLE ingredient (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE recipe (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    directions TEXT NOT NULL,
    link TEXT NOT NULL
);

CREATE TABLE recipe_ingredient (
    recipe_id INTEGER NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id),

    amount REAL NOT NULL
);

INSERT INTO ingredient
    (name)
VALUES
    ('Salt'),
    ('Sugar'),
    ('Flour'),
    ('Eggs'),
    ('Butter'),
    ('Onion'),
    ('Milk')
