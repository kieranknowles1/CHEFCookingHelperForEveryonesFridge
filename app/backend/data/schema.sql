DROP TABLE IF EXISTS recipe;

CREATE TABLE recipe (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    directions TEXT NOT NULL,
    link TEXT NOT NULL
);