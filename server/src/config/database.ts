import { Pool } from 'pg';

const dbPassword = 'npg_q2ALW1cTvJyo';
const connectionString = `postgresql://neondb_owner:${dbPassword}@ep-dawn-cherry-a2p7hgef-pooler.eu-central-1.aws.neon.tech/propertydb?sslmode=require`;

const pool = new Pool({
  connectionString,
  ssl: false
});

export default pool; 