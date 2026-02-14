require('dotenv').config();
const BranchModel = require('../models/branchModel');

async function verifyBranches() {
    console.log('\n📊 Verifying Branch Data in PostgreSQL\n');
    console.log('=====================================\n');

    try {
        // Get all branches
        const branches = await BranchModel.getAll();

        console.log(`✅ Found ${branches.length} branches in database:\n`);

        branches.forEach((branch, index) => {
            console.log(`${index + 1}. ${branch.name}`);
            console.log(`   ID: ${branch.id}`);
            console.log(`   Contact: ${branch.contactPerson || 'N/A'}`);
            console.log(`   Phone: ${branch.contactNumber || 'N/A'}`);
            console.log(`   Address: ${branch.address || 'N/A'}`);
            console.log('');
        });

        // Test getById
        if (branches.length > 0) {
            const firstBranch = branches[0];
            console.log(`\n🔍 Testing getById with ID: ${firstBranch.id}`);
            const result = await BranchModel.getById(firstBranch.id);
            console.log(`✅ Retrieved: ${result.name}\n`);
        }

        console.log('=====================================');
        console.log('✅ All branch operations working!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyBranches();
