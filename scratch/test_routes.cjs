const http = require('http');

const testPost = (path, data) => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });

        req.on('error', (e) => reject(e));
        req.write(postData);
        req.end();
    });
};

async function runTests() {
    try {
        console.log('Testing /api/custom-designs...');
        const res1 = await testPost('/api/custom-designs', {
            userId: 1,
            imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            description: 'Test design'
        });
        console.log('Response:', res1);

        console.log('Testing /api/orders (Note: might fail if items invalid, but checking for mailer errors)...');
        // This might fail due to missing items or database state, but we want to see if it triggers an error
        const res2 = await testPost('/api/orders', {
            userId: 1,
            totalAmount: 100,
            address: { fullName: 'Test User', address: '123 Test St' },
            items: [],
            paymentMethod: 'cod'
        });
        console.log('Response:', res2);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTests();
