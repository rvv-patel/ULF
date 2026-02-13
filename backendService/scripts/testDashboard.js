const http = require('http');

function testDashboardApi() {
    console.log('Testing Dashboard API...');

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/dashboard/stats',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log('Status:', res.statusCode);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const jsonData = JSON.parse(data);
                    console.log('Data received successfully.');
                    console.log('Summary:', JSON.stringify(jsonData.summary, null, 2));
                } else {
                    console.log('Error Response:', data);
                }
            } catch (e) {
                console.log('Raw Data:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('API Error:', e.message);
    });

    req.end();
}

testDashboardApi();
