PRAGMA foreign_keys = ON;

PRAGMA user_version = 1;

DROP TABLE IF EXISTS recipe_ingredient;
DROP TABLE IF EXISTS ingredient_alt_name;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS recipe;

DROP VIEW IF EXISTS view_ingredient_by_name;

CREATE TABLE ingredient (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    assumeUnlimited BOOLEAN NOT NULL DEFAULT FALSE,

    -- NOTE: Must match enum in Unit.ts
    preferredUnit TEXT CHECK(preferredUnit IN ('none', 'whole', 'ml', 'g')) NOT NULL,

    -- g/ml
    density REAL
);

CREATE INDEX index_ingredient_by_name_nocase
    ON ingredient(name COLLATE NOCASE);

-- Alternate names for ingredients that are recognised by data import
CREATE TABLE ingredient_alt_name (
    name TEXT NOT NULL,
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id)
);

CREATE INDEX index_ingredient_alt_name_by_name_nocase
    ON ingredient_alt_name(name COLLATE NOCASE);

CREATE VIEW view_ingredient_by_name AS
    SELECT name, id FROM ingredient
        UNION ALL
    SELECT name, ingredient_id AS id FROM ingredient_alt_name;

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

-- //TODO: Handle plurals (ingredient alias table? e.g., Onions => Onion)

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
