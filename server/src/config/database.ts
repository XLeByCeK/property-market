import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Загружаем переменные из .env

// Используем переменную окружения DATABASE_URL
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  // Для Neon DB ssl часто обязателен на продакшене, 
  // но для локальной разработки можно оставить так или настроить через env
  ssl: connectionString?.includes('aws.neon.tech') ? { rejectUnauthorized: false } : false
});

export default pool;