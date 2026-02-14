const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

const runTests = async () => {
    console.log('🚀 Starting API Verification for Documents (CamelCase Tables)...');

    let token = '';

    try {
        // --- Login ---
        console.log('\n🔑 Logging in...');
        try {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'sagar@gmail.com', // Staff credentials from testLogin.js
                password: 'Test@123'
            });
            token = loginRes.data.token;
            console.log('✅ Login successful!');
        } catch (error) {
            throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
        }

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // --- Application Documents ---
        console.log('\n📄 Testing Application Documents API...');

        // 1. Get All
        console.log('  GET /application-documents');
        let res = await axios.get(`${BASE_URL}/application-documents`, config);
        console.log(`  ✅ Success: Retrieved ${res.data.items.length} items`);

        // 2. Create
        console.log('  POST /application-documents');
        const newAppDoc = { title: 'API Test Doc Camel', documentFormat: 'PDF' };
        res = await axios.post(`${BASE_URL}/application-documents`, newAppDoc, config);
        const createdAppDoc = res.data;
        if (createdAppDoc.title === newAppDoc.title) {
            console.log(`  ✅ Created: ${createdAppDoc.title} (ID: ${createdAppDoc.id})`);
        } else {
            throw new Error('Title mismatch on create');
        }

        // 3. Update
        console.log(`  PUT /application-documents/${createdAppDoc.id}`);
        const updatedTitle = 'API Test Doc Camel Updated';
        res = await axios.put(`${BASE_URL}/application-documents/${createdAppDoc.id}`, { title: updatedTitle }, config);
        if (res.data.title === updatedTitle) {
            console.log(`  ✅ Updated title to: ${res.data.title}`);
        } else {
            throw new Error('Title mismatch on update');
        }

        // 4. Delete
        console.log(`  DELETE /application-documents/${createdAppDoc.id}`);
        await axios.delete(`${BASE_URL}/application-documents/${createdAppDoc.id}`, config);
        console.log('  ✅ Deleted successfully');


        // --- Company Documents ---
        console.log('\n🏢 Testing Company Documents API...');

        // 1. Get All
        console.log('  GET /company-documents');
        res = await axios.get(`${BASE_URL}/company-documents`, config);
        console.log(`  ✅ Success: Retrieved ${res.data.items.length} items`);

        // 2. Create
        console.log('  POST /company-documents');
        const newCompDoc = { title: 'API Test Comp Doc Camel', documentFormat: '.docx' };
        res = await axios.post(`${BASE_URL}/company-documents`, newCompDoc, config);
        const createdCompDoc = res.data;
        if (createdCompDoc.title === newCompDoc.title) {
            console.log(`  ✅ Created: ${createdCompDoc.title} (ID: ${createdCompDoc.id})`);
        } else {
            throw new Error('Title mismatch on create');
        }

        // 3. Update
        console.log(`  PUT /company-documents/${createdCompDoc.id}`);
        const updatedCompTitle = 'API Test Comp Doc Camel Updated';
        res = await axios.put(`${BASE_URL}/company-documents/${createdCompDoc.id}`, { title: updatedCompTitle }, config);
        if (res.data.title === updatedCompTitle) {
            console.log(`  ✅ Updated title to: ${res.data.title}`);
        } else {
            throw new Error('Title mismatch on update');
        }

        // 4. Delete
        console.log(`  DELETE /company-documents/${createdCompDoc.id}`);
        await axios.delete(`${BASE_URL}/company-documents/${createdCompDoc.id}`, config);
        console.log('  ✅ Deleted successfully');

        console.log('\n🎉 API Verification Passed!');

    } catch (error) {
        console.error('❌ API Verification Failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
};

runTests();
