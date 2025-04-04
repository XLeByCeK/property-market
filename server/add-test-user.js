require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function addTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Delete existing test user if exists
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    
    // Create new test user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
      ['test@example.com', hashedPassword, 'Test', 'User']
    );
    
    console.log('Test user created successfully:');
    console.log({
      id: result.rows[0].id,
      email: result.rows[0].email,
      first_name: result.rows[0].first_name,
      last_name: result.rows[0].last_name
    });
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

addTestUser(); 