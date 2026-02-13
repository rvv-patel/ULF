const bcrypt = require('bcryptjs');

const password = 'Password@123';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) console.error(err);
    console.log('Hash for Password@123:', hash);
});
