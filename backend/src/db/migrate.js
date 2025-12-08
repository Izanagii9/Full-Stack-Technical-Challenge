import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getMigratedFiles() {
  const result = await pool.query('SELECT filename FROM schema_migrations');
  return new Set(result.rows.map(row => row.filename));
}

async function recordMigration(filename) {
  await pool.query(
    'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING',
    [filename]
  );
}

async function runMigrations() {
  try {
    console.log('Starting database migrations...\n');

    // Create migrations tracking table
    await ensureMigrationsTable();

    // Get list of already applied migrations
    const migratedFiles = await getMigratedFiles();

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    let appliedCount = 0;

    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        if (migratedFiles.has(file)) {
          console.log(`⊘ ${file} (already applied)`);
          continue;
        }

        console.log(`Running migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await pool.query(sql);
        await recordMigration(file);
        console.log(`✓ ${file} completed\n`);
        appliedCount++;
      }
    }

    if (appliedCount === 0) {
      console.log('No new migrations to apply.');
    } else {
      console.log(`\nAll migrations completed successfully! (${appliedCount} applied)`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
