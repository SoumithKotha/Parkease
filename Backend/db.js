const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://soumithreddy@localhost:5432/parkease',
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
