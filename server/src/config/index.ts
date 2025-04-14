import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
];

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Missing required environment variables:');
  missingEnvVars.forEach((envVar) => {
    console.error(`  - ${envVar}`);
  });
  console.error('\x1b[33m%s\x1b[0m', 'Please add them to your .env file.');
  process.exit(1);
}

// Configuration object
const config = {
  port: process.env.PORT || 3001,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  environment: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://127.0.0.1:3000'],
};

// Log the environment being used
console.log(`Server running in ${config.environment} mode`);

export default config; 