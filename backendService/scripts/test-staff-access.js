const API_URL = process.env.API_URL || 'http://localhost:5001';

// Test login as sagar@gmail.com and fetch applications
const testStaffAccess = async () => {
    try {
        console.log('=== Testing Staff Access Control ===\n');

        // Login as sagar
        console.log('1. Logging in as sagar@gmail.com...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'sagar@gmail.com',
                password: 'Test@123'
            })
        });

        if (!loginRes.ok) {
            console.log('❌ Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        console.log('✅ Login successful');
        console.log('   Role:', loginData.role);
        console.log('   Assigned Companies:', loginData.assignedCompanies);

        const token = loginData.token;

        // Fetch applications
        console.log('\n2. Fetching applications...');
        const appsRes = await fetch(`${API_URL}/applications?limit=100`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!appsRes.ok) {
            console.log('❌ Failed to fetch applications:', await appsRes.text());
            return;
        }

        const appsData = await appsRes.json();
        console.log(`✅ Retrieved ${appsData.items.length} applications`);

        // Display applications
        console.log('\nApplications visible to sagar@gmail.com:');
        if (appsData.items.length === 0) {
            console.log('   ⚠️  No applications visible (this is the BUG if companies are assigned!)');
        } else {
            appsData.items.forEach(app => {
                console.log(`   - ${app.fileNumber}: ${app.company}`);
            });
        }

        // Verify only assigned companies
        const uniqueCompanies = [...new Set(appsData.items.map(app => app.company))];
        console.log('\nUnique companies in results:', uniqueCompanies);

    } catch (error) {
        console.error('Error:', error.message);
    }
};

testStaffAccess();
