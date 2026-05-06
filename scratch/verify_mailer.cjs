const { sendOrderNotification } = require('../server/mailer');

async function test() {
    console.log('--- Starting Direct Mailer Test ---');
    const mockOrder = {
        id: 'TEST-123',
        address: {
            fullName: 'Test User',
            email: 'test@example.com',
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '123456'
        },
        items: [
            { name: 'Test Product 1', quantity: 2, price: 500 },
            { name: 'Test Product 2', quantity: 1, price: 1000 }
        ],
        totalAmount: 2000,
        paymentMethod: 'UPI'
    };

    console.log('Calling sendOrderNotification...');
    await sendOrderNotification(mockOrder);
    console.log('--- Direct Mailer Test Finished ---');
    process.exit(0);
}

test().catch(err => {
    console.error('Test script error:', err);
    process.exit(1);
});
