# Test Databases

This directory contains databases with different states of validity.

`valid.db` is a valid database with no errors.

`corrupt.db` is a corrupt database that should be readable but should fail `PRAGMA integrity_check`.
Identical to `valid.db` except that the byte at offset 0x1FCD is changed from 0x2F to 0x41.

`badforeignkey.db` should pass `PRAGMA integrity_check` but should fail `PRAGMA foreign_key_check`.
Identical to `valid.db` except that a note with ID 3 is added with a foreign key to the non-existent user with ID 1234.
