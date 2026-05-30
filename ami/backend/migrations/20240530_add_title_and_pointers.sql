/* Migration: add title and pointers columns */
await sql`ALTER TABLE modules ADD COLUMN title TEXT;`;
await sql`ALTER TABLE modules ADD COLUMN pointers JSONB;`;
