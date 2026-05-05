const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Mailer module loading...');

// Breakthrough configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true,
    connectionTimeout: 10000, // 10 seconds only
    greetingTimeout: 10000,
    socketTimeout: 10000
});

console.log('Attempting SMTP verification...');
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ SMTP VERIFY FAILED:', error.message);
    } else {
        console.log('✅ SMTP VERIFY SUCCESS: Ready to send!');
    }
});

const adminEmail = process.env.ADMIN_EMAIL || 'abbas6618532@gmail.com';

const sendOrderNotification = async (order) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `New Order #${order.id}`,
            html: `<h2>New Order</h2><p>Customer: ${order.address.fullName}</p>`
        });
        console.log('Email sent!');
    } catch (err) {
        console.error('Send Error:', err.message);
    }
};

const sendCancellationNotification = async (order) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `Order Cancelled #${order.id}`,
            html: `<h3>Order Cancelled</h3>`
        });
        console.log('Cancel email sent!');
    } catch (err) {
        console.error('Cancel Error:', err.message);
    }
};

const sendCustomServiceNotification = async (design) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    let mailOptions = {
        from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `Custom Design User ${design.userId}`,
        html: `<h3>New Design</h3><p>${design.description || ''}</p>`
    };
    if (design.imageUrl && design.imageUrl.startsWith('data:image')) {
        const base64Data = design.imageUrl.split(';base64,').pop();
        mailOptions.attachments = [{
            filename: 'design.png',
            content: base64Data,
            encoding: 'base64'
        }];
    }
    try {
        await transporter.sendMail(mailOptions);
        console.log('Custom email sent!');
    } catch (err) {
        console.error('Custom Error:', err.message);
    }
};

const sendCustomServiceStatusNotification = async (design, status) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `Design Status: ${status}`,
            html: `<p>Status: ${status}</p>`
        });
        console.log('Status email sent!');
    } catch (err) {
        console.error('Status Error:', err.message);
    }
};

module.exports = { 
    sendOrderNotification, 
    sendCancellationNotification,
    sendCustomServiceNotification,
    sendCustomServiceStatusNotification
};
