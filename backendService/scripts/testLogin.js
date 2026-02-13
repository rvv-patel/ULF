// Test script for login API
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testLogin() {
    console.log('=== Testing Login API ===\n');

    // Test 1: Login with admin credentials
    console.log('Test 1: Login with admin@gmail.com');
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'ravi@gmail.com',
            password: 'Test@123'
        });
        console.log('✅ Login successful!');
        console.log('Token:', response.data.token.substring(0, 20) + '...');
        console.log('User:', response.data.user.email, '-', response.data.user.role);
        console.log('Permissions count:', response.data.user.permissions?.length);
    } catch (error) {
        console.log('❌ Login failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message || error.response.data);
        } else if (error.request) {
            console.log('No response received. Is the server running?');
            console.log('Server URL:', API_URL);
        } else {
            console.log('Error:', error.message);
        }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Login with staff credentials
    console.log('Test 2: Login with sagar@gmail.com');
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'sagar@gmail.com',
            password: 'Test@123'
        });
        console.log('✅ Login successful!');
        console.log('Token:', response.data.token.substring(0, 20) + '...');
        console.log('User:', response.data.user.email, '-', response.data.user.role);
        console.log('Permissions count:', response.data.user.permissions?.length);
    } catch (error) {
        console.log('❌ Login failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message || error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Invalid credentials
    console.log('Test 3: Login with invalid credentials');
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'invalid@gmail.com',
            password: 'wrongpassword'
        });
        console.log('❌ Should have failed but succeeded!');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ Correctly rejected invalid credentials');
            console.log('Message:', error.response.data.message);
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Health check
    console.log('Test 4: Server health check');
    try {
        const response = await axios.get('http://localhost:3001/');
        console.log('✅ Server is running');
        console.log('Message:', response.data.message);
    } catch (error) {
        console.log('❌ Server not responding');
        console.log('Error:', error.message);
    }

    console.log('\n=== Test Complete ===');
}

// Run tests
testLogin().catch(console.error);
