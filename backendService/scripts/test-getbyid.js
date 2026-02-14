require('dotenv').config();
const BranchModel = require('../models/branchModel');

async function testGetById() {
    console.log('\n🧪 Testing BranchModel.getById(2)...\n');

    try {
        const branch = await BranchModel.getById(2);

        if (branch) {
            console.log('✅ Branch found!');
            console.log('\nData returned:');
            console.log(JSON.stringify(branch, null, 2));
        } else {
            console.log('❌ Branch not found (returned null)');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testGetById();
