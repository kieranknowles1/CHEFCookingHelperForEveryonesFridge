PRAGMA user_version = 1;
PRAGMA journal_mode = WAL;

-- Drop all existing tables
-- Disable foreign keys while doing so
-- so that we don't have to drop tables in a specific order
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS embedding;

DROP TABLE IF EXISTS tag;

DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS ingredient_tag;
DROP TABLE IF EXISTS ingredient_alt_name;
DROP TABLE IF EXISTS ingredient_substitution_group;
DROP TABLE IF EXISTS ingredient_substitution_entry;
DROP VIEW IF EXISTS view_ingredient_by_name;

DROP TABLE IF EXISTS meal_type;
DROP TABLE IF EXISTS recipe;
DROP TABLE IF EXISTS recipe_ingredient;

DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS user_banned_tag;
DROP TABLE IF EXISTS user_banned_ingredient;

DROP TABLE IF EXISTS fridge;
DROP TABLE IF EXISTS fridge_user;
DROP TABLE IF EXISTS fridge_ingredient;
DROP TABLE IF EXISTS made_recipe;
DROP TABLE IF EXISTS made_recipe_user;
DROP TABLE IF EXISTS barcode;

PRAGMA foreign_keys = ON;

-- =========
--  Tagging
-- =========
CREATE TABLE tag (
    id INTEGER NOT NULL PRIMARY KEY,

    name TEXT NOT NULL UNIQUE,
    -- Brief (1 sentence) description of why it may not be suitable for someone
    description TEXT NOT NULL
);
CREATE INDEX index_tag_by_name
    ON tag(name);

-- ==================
--  Machine Learning
-- ==================

CREATE TABLE embedding (
    sentence TEXT NOT NULL PRIMARY KEY,
    -- 512 float32s, 2048 bytes
    embedding BLOB NOT NULL
);
CREATE INDEX index_embedding_by_sentence
    ON embedding(sentence);

-- =============
--  Ingredients
-- =============

CREATE TABLE ingredient (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    assumeUnlimited BOOLEAN NOT NULL DEFAULT FALSE,

    -- NOTE: Must match enum in Unit.ts
    preferredUnit TEXT CHECK(preferredUnit IN ('none', 'whole', 'ml', 'g')) NOT NULL,

    -- g/ml
    density REAL
);
CREATE INDEX index_ingredient_by_name_nocase
    ON ingredient(name COLLATE NOCASE);

CREATE TABLE ingredient_tag (
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id),
    tag_id INTEGER NOT NULL REFERENCES tag(id),

    PRIMARY KEY (ingredient_id, tag_id)
);

-- Alternate names for ingredients that are recognised by data import
CREATE TABLE ingredient_alt_name (
    name TEXT NOT NULL UNIQUE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id)
);

CREATE TABLE ingredient_substitution_group (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE ingredient_substitution_entry (
    group_id INTEGER NOT NULL REFERENCES ingredient_substitution_group(id),
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id)
);
CREATE INDEX index_ingredient_alt_name_by_name_nocase
    ON ingredient_alt_name(name COLLATE NOCASE);

CREATE VIEW view_ingredient_by_name AS
    SELECT name, id FROM ingredient
        UNION ALL
    SELECT name, ingredient_id AS id FROM ingredient_alt_name;

CREATE TABLE barcode (
    code INTEGER NOT NULL PRIMARY KEY,
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id),

    product_name TEXT NOT NULL,
    amount REAL NOT NULL
);

-- =========
--  Recipes
-- =========

CREATE TABLE meal_type (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE REFERENCES embedding(sentence)
);
CREATE INDEX index_meal_type_by_name
    ON meal_type(name);

CREATE TABLE recipe (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL REFERENCES embedding(sentence),
    directions TEXT NOT NULL,
    link TEXT NOT NULL,
    meal_type_id INTEGER NOT NULL REFERENCES meal_type(id)
);
CREATE INDEX index_recipe_by_name_nocase
    ON recipe(name COLLATE NOCASE ASC);
CREATE INDEX index_recipe_by_meal_type_id
    ON recipe(meal_type_id);

CREATE TABLE recipe_ingredient (
    recipe_id INTEGER NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id),

    amount REAL,
    original_line TEXT NOT NULL,

    PRIMARY KEY (recipe_id, ingredient_id)
);
CREATE INDEX index_recipe_ingredient_by_recipe_id
    ON recipe_ingredient(recipe_id);

-- =======
--  Users
-- =======

CREATE TABLE user (
    id INTEGER NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL
);
CREATE INDEX index_user_by_username
    ON user(username);

CREATE TABLE user_banned_tag (
    user_id INTEGER NOT NULL REFERENCES user(id),
    tag_id INTEGER NOT NULL REFERENCES tag(id),

    PRIMARY KEY (user_id, tag_id)
);

CREATE TABLE user_banned_ingredient (
    user_id INTEGER NOT NULL REFERENCES user(id),
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id),

    PRIMARY KEY (user_id, ingredient_id)
);

-- =========
--  Fridges
-- =========

CREATE TABLE fridge (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE fridge_user (
    fridge_id INTEGER NOT NULL REFERENCES fridge(id),
    user_id INTEGER NOT NULL REFERENCES user(id),
    PRIMARY KEY (fridge_id, user_id)
);

CREATE TABLE fridge_ingredient (
    fridge_id INTEGER NOT NULL REFERENCES fridge(id),
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(id),
    amount REAL NOT NULL,

    PRIMARY KEY (fridge_id, ingredient_id)
);
CREATE INDEX index_fridge_ingredient_by_fridge_id
    ON fridge_ingredient(fridge_id);

CREATE TABLE made_recipe (
    id INTEGER NOT NULL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipe(id),
    fridge_id INTEGER NOT NULL REFERENCES fridge(id),
    -- ISO 8601
    date_made DATETIME NOT NULL
);
CREATE INDEX index_made_recipe_by_fridge_id_and_date_made
    ON made_recipe(fridge_id, date_made ASC);

CREATE TABLE made_recipe_user (
    made_recipe_id INTEGER NOT NULL REFERENCES made_recipe(id),
    user_id INTEGER NOT NULL REFERENCES user(id)
);
