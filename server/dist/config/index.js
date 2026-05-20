"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config({
    path: path_1.default.resolve(process.cwd(), '.env')
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
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    environment: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS ?
        process.env.CORS_ORIGINS.split(',') :
        ['http://localhost:3000', 'http://127.0.0.1:3000'],
};
// Log the environment being used
console.log(`Server running in ${config.environment} mode`);
exports.default = config;
