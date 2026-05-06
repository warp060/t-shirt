const https = require('https');
const path = require('path');
const { 
    getOrderTemplate, 
    getCancellationTemplate, 
    getCustomDesignTemplate, 
    getCustomStatusTemplate 
} = require('./templates');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Mailer module loading (API Mode)...');

const sendToAdmins = async (subject, html) => {
    const adminEmails = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.split(',').map(e => e.trim()) : [];
    
    if (adminEmails.length === 0) {
        console.error('❌ No admin emails found in ADMIN_EMAIL environment variable');
        return;
    }

    const apiKey = process.env.EMAIL_PASS;
    const senderEmail = process.env.EMAIL_USER;

    for (const adminEmail of adminEmails) {
        const data = JSON.stringify({
            sender: { email: senderEmail, name: 'Abbas Threads' },
            to: [{ email: adminEmail }],
            subject: subject,
            htmlContent: html
        });

        const options = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ Email sent via API to ${adminEmail}`);
                } else {
                    console.error(`❌ API Error for ${adminEmail}:`, body);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Request Error for ${adminEmail}:`, error);
        });

        req.write(data);
        req.end();
    }
};

const sendOrderNotification = (orderData) => {
    return sendToAdmins(`New Order: ${orderData.order_id}`, getOrderTemplate(orderData));
};

const sendCancellationNotification = (orderData) => {
    return sendToAdmins(`Order Cancelled: ${orderData.order_id}`, getCancellationTemplate(orderData));
};

const sendCustomDesignNotification = (designData) => {
    return sendToAdmins('New Custom Design Request', getCustomDesignTemplate(designData));
};

const sendCustomStatusUpdate = (designData) => {
    return sendToAdmins(`Design Request Update: ${designData.id}`, getCustomStatusTemplate(designData));
};

console.log('✅ Mailer initialized in API Mode');

module.exports = {
    sendOrderNotification,
    sendCancellationNotification,
    sendCustomDesignNotification,
    sendCustomStatusUpdate
};
