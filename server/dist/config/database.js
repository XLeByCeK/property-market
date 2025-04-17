"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dbPassword = 'npg_q2ALW1cTvJyo';
const connectionString = `postgresql://neondb_owner:${dbPassword}@ep-dawn-cherry-a2p7hgef-pooler.eu-central-1.aws.neon.tech/propertydb?sslmode=require`;
const pool = new pg_1.Pool({
    connectionString,
    ssl: false
});
exports.default = pool;
