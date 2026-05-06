const nodemailer = require('nodemailer');
const { 
    getOrderTemplate, 
    getCancellationTemplate, 
    getCustomDesignTemplate, 
    getCustomStatusTemplate 
} = require('./templates');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Mailer module loading...');
console.log('Environment Check:', {
    EMAIL_USER: process.env.EMAIL_USER ? 'FOUND' : 'MISSING',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'FOUND' : 'MISSING',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'FOUND' : 'MISSING'
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4, // Force IPv4
    connectionTimeout: 20000, // Increase timeout for cloud
    greetingTimeout: 20000,
    socketTimeout: 20000
});

console.log('Attempting SMTP verification...');
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ SMTP VERIFY FAILED:', error.message);
    } else {
        console.log('✅ SMTP VERIFY SUCCESS: Ready to send!');
    }
});

// Support multiple admin emails separated by comma
const adminEmails = (process.env.ADMIN_EMAIL || 'abbas6618532@gmail.com')
    .split(',')
    .map(e => e.trim())
    .filter(e => e);

/**
 * Sends an email to all configured administrators individually
 */
const sendToAdmins = async (subject, html, attachments = []) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Mailer: EMAIL_USER or EMAIL_PASS not configured.');
        return;
    }

    const sendPromises = adminEmails.map(adminEmail => {
        return transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: subject,
            html: html,
            attachments: attachments
        }).then(info => {
            console.log(`✅ Email sent to admin: ${adminEmail}`);
            return info;
        }).catch(err => {
            console.error(`❌ Failed to send email to ${adminEmail}:`, err.message);
        });
    });

    await Promise.all(sendPromises);
};

const sendOrderNotification = async (order) => {
    try {
        const html = getOrderTemplate(order);
        await sendToAdmins(`New Order #${order.id} - ${order.address.fullName}`, html);
    } catch (err) {
        console.error('Order Notification Error:', err.message);
    }
};

const sendCancellationNotification = async (order) => {
    try {
        const html = getCancellationTemplate(order);
        await sendToAdmins(`Order Cancelled #${order.id}`, html);
    } catch (err) {
        console.error('Cancellation Notification Error:', err.message);
    }
};

const sendCustomServiceNotification = async (design) => {
    try {
        const html = getCustomDesignTemplate(design);
        let attachments = [];
        
        if (design.imageUrl && design.imageUrl.startsWith('data:image')) {
            const base64Data = design.imageUrl.split(';base64,').pop();
            attachments = [{
                filename: 'design.png',
                content: base64Data,
                encoding: 'base64'
            }];
        }
        
        await sendToAdmins(`Custom Design Request - User ${design.userId}`, html, attachments);
    } catch (err) {
        console.error('Custom Service Notification Error:', err.message);
    }
};

const sendCustomServiceStatusNotification = async (design, status) => {
    try {
        const html = getCustomStatusTemplate(design, status);
        await sendToAdmins(`Design Status Updated: ${status}`, html);
    } catch (err) {
        console.error('Status Notification Error:', err.message);
    }
};

module.exports = { 
    sendOrderNotification, 
    sendCancellationNotification,
    sendCustomServiceNotification,
    sendCustomServiceStatusNotification
};
