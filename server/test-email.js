require('dotenv').config();
const { sendOrderNotification } = require('./mailer');

async function test() {
    console.log("Testing email...");
    const order = { id: 'TEST-123', totalAmount: 100, address: { fullName: 'Test User' }, paymentMethod: 'cod' };
    const items = [{ name: 'Test Shirt', quantity: 1, price: 100 }];
    const success = await sendOrderNotification(order, items);
    if (success) {
        console.log("Email test SUCCESS!");
    } else {
        console.log("Email test FAILED!");
    }
}
test();
