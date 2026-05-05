const nodemailer = require('nodemailer');
require('dotenv').config();

// Use explicit host and port 587 (Standard for many cloud servers)
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
    }
});

// Self-test on startup
transporter.verify((error, success) => {
    if (error) {
        console.log('--- SMTP ERROR ON STARTUP ---');
        console.log('Error Code:', error.code);
        console.log('Message:', error.message);
        console.log('------------------------------');
    } else {
        console.log('✅ SMTP READY: Server is connected to Gmail');
    }
});

const adminEmail = process.env.ADMIN_EMAIL || 'abbas6618532@gmail.com';

const sendOrderNotification = async (order) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.name}</strong> x ${item.quantity}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                ₹${(item.price * item.quantity).toLocaleString('en-IN')}
            </td>
        </tr>
    `).join('');

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">ABBAS THREADS</h1>
                <p style="margin: 5px 0 0 0; color: #aaa;">New Order Notification</p>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #333;">Order Details</h2>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${order.address.fullName}</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tbody>${itemsHtml}</tbody>
                    <tfoot>
                        <tr>
                            <td style="padding: 10px; font-weight: bold;">Total</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `New Order Received # ${order.id}`,
            html: htmlContent
        });
        console.log(`Order email sent to ${adminEmail}`);
    } catch (err) {
        console.error('Order Email Failed:', err.message);
    }
};

const sendCancellationNotification = async (order) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `⚠️ Order CANCELLED # ${order.id}`,
            html: `<h3>Order #${order.id} was cancelled by the customer.</h3>`
        });
        console.log('Cancellation email sent');
    } catch (err) {
        console.error('Cancel Email Failed:', err.message);
    }
};

const sendCustomServiceNotification = async (design) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    let mailOptions = {
        from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `New Custom Design Request from User ${design.userId}`,
        html: `<h3>New Custom Design Request</h3><p>${design.description || 'No description'}</p>`
    };

    if (design.imageUrl && design.imageUrl.startsWith('data:image')) {
        const base64Data = design.imageUrl.split(';base64,').pop();
        mailOptions.attachments = [{
            filename: `design_${Date.now()}.png`,
            content: base64Data,
            encoding: 'base64'
        }];
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log('Custom design email sent');
    } catch (err) {
        console.error('Custom Email Failed:', err.message);
    }
};

const sendCustomServiceStatusNotification = async (design, status) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `Custom Design #${design.id} Status: ${status.toUpperCase()}`,
            html: `<p>The status of your custom design request #${design.id} has been updated to: <b>${status}</b></p>`
        });
        console.log('Status email sent');
    } catch (err) {
        console.error('Status Email Failed:', err.message);
    }
};

module.exports = { 
    sendOrderNotification, 
    sendCancellationNotification,
    sendCustomServiceNotification,
    sendCustomServiceStatusNotification
};
