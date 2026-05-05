const nodemailer = require('nodemailer');
require('dotenv').config();

// Standard transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// We use the comma-separated string directly as Nodemailer supports it
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
                <p><strong>Customer:</strong> ${order.address.fullName} (${order.address.email})</p>
                <p><strong>Phone:</strong> ${order.address.phone}</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tbody>${itemsHtml}</tbody>
                    <tfoot>
                        <tr>
                            <td style="padding: 10px; font-weight: bold;">Total Amount</td>
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
            subject: `New Order Received # ${order.id} - ₹${order.totalAmount}`,
            html: htmlContent
        });
        console.log('Order notification sent');
    } catch (error) {
        console.error('Email Error:', error.message);
    }
};

const sendCancellationNotification = async (order) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #ff4d4d; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">ORDER CANCELLED</h1>
            </div>
            <div style="padding: 20px;">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${order.address.fullName}</p>
                <p><strong>Amount:</strong> ₹${order.total_amount.toLocaleString('en-IN')}</p>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `⚠️ Order CANCELLED # ${order.id}`,
            html: htmlContent
        });
        console.log('Cancellation notification sent');
    } catch (error) {
        console.error('Email Error:', error.message);
    }
};

const sendCustomServiceNotification = async (design) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">ABBAS THREADS</h1>
                <p>New Custom Service Request</p>
            </div>
            <div style="padding: 20px;">
                <p><strong>User ID:</strong> ${design.userId}</p>
                <p><strong>Description:</strong> ${design.description || 'No description'}</p>
            </div>
        </div>
    `;

    let mailOptions = {
        from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `New Custom Design Request from User ${design.userId}`,
        html: htmlContent
    };

    if (design.imageUrl && design.imageUrl.startsWith('data:image')) {
        try {
            const base64Data = design.imageUrl.split(';base64,').pop();
            const mimeType = design.imageUrl.split(';')[0].split(':')[1];
            const ext = mimeType.split('/')[1] || 'png';
            mailOptions.attachments = [{
                filename: `design_${design.userId}.${ext}`,
                content: base64Data,
                encoding: 'base64'
            }];
        } catch (e) {
            console.error('Attach error:', e.message);
        }
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log('Custom design notification sent');
    } catch (error) {
        console.error('Email Error:', error.message);
    }
};

const sendCustomServiceStatusNotification = async (design, status) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Custom Request Update</h2>
            <p><strong>Design ID:</strong> ${design.id}</p>
            <p><strong>Status:</strong> ${status.toUpperCase()}</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `Custom Design Request #${design.id} Status: ${status.toUpperCase()}`,
            html: htmlContent
        });
        console.log('Status notification sent');
    } catch (error) {
        console.error('Email Error:', error.message);
    }
};

module.exports = { 
    sendOrderNotification, 
    sendCancellationNotification,
    sendCustomServiceNotification,
    sendCustomServiceStatusNotification
};
