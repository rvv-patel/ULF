require('dotenv').config();
const { Pool } = require('pg');

console.log('\n🔍 Testing PostgreSQL Connection...\n');
console.log('Configuration:');
console.log('  Host:', process.env.DB_HOST);
console.log('  Port:', process.env.DB_PORT);
console.log('  Database:', process.env.DB_NAME);
console.log('  User:', process.env.DB_USER);
console.log('  Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'NOT SET');
console.log('');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function testConnection() {
    try {
        console.log('Attempting to connect...');
        const client = await pool.connect();
        console.log('✅ Connection successful!\n');

        const result = await client.query('SELECT version()');
        console.log('PostgreSQL version:', result.rows[0].version);

        client.release();
        await pool.end();

        console.log('\n✅ Database connection test PASSED!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('\nCommon fixes:');
        console.error('  - Check if PostgreSQL service is running');
        console.error('  - Verify password in .env file');
        console.error('  - Ensure database "legal_app_db" exists');
        console.error('  - Check if user "postgres" has correct permissions\n');

        await pool.end();
        process.exit(1);
    }
}

testConnection();
