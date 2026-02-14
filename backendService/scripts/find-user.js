const pool = require('../config/database');

const findUser = async () => {
    try {
        const result = await pool.query('SELECT * FROM users LIMIT 1');
        console.log('User found:', result.rows[0]);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findUser();
