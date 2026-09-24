// Creates the database (if missing) and applies database/schema.sql.
// Run from the backend folder:  npm run db:setup
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const dbName = process.env.DB_NAME || 'klein_ecommerce';

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  await connection.query(sql);
  await connection.end();

  console.log(`Database "${dbName}" is ready — tables created and seed data inserted.`);
}

main().catch((err) => {
  console.error('Could not set up the database:', err.message);
  process.exit(1);
});
