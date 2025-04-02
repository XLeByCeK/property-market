import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../config/database';

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Read and execute migration file
    const migrationPath = join(__dirname, 'migrations/001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('Migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error); 