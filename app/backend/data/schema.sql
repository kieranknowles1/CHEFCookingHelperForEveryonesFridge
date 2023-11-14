PRAGMA foreign_keys = ON;

PRAGMA user_version = 1;

DROP TABLE IF EXISTS recipe_ingredient;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS recipe;

CREATE TABLE ingredient (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    assumeUnlimited BOOLEAN NOT NULL DEFAULT FALSE,

    -- NOTE: Must match enum in Unit.ts
    preferredUnit TEXT CHECK(preferredUnit IN ('none', 'whole', 'ml', 'g')) NOT NULL,

    -- g/ml
    density REAL
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

CREATE INDEX index_recipe_ingredient_by_recipe_id
    ON recipe_ingredient(recipe_id);

INSERT INTO ingredient
    (name, preferredUnit)
VALUES
    ('Salt', 'none'),
    ('Eggs', 'whole'),
    ('Onion', 'whole');

INSERT INTO ingredient
    (name, preferredUnit, assumeUnlimited)
VALUES
    ('Water', 'ml', true);

-- Source: https://annaolson.ca/baking-conversions/
INSERT INTO ingredient
    (name, preferredUnit, density)
VALUES
    ('Butter', 'g', 0.9),
    ('Flour', 'g', 0.6),
    ('Milk', 'ml', 1.0),
    ('Sugar', 'g', 0.8);
