const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const adminEmail = process.env.ADMIN_EMAIL || 'abbas6618532@gmail.com';

const sendOrderNotification = async (order) => {
    
    // Fallback if no credentials provided
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('--------------------------------------------------');
        console.log('LOGGING EMAIL (SMTP Credentials Missing)');
        console.log(`To: ${adminEmail}`);
        console.log(`Subject: New Order Received - ID: ${order.id}`);
        console.log(`Content: Customer ${order.address.fullName} placed an order for ₹${order.totalAmount}`);
        console.log('--------------------------------------------------');
        return;
    }

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
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Customer:</strong> ${order.address.fullName} (${order.address.email})</p>
                <p><strong>Phone:</strong> ${order.address.phone}</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #f9f9f9;">
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style="padding: 10px; font-weight: bold;">Total Amount</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.2em;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                    <h3 style="margin-top: 0; font-size: 1em;">Shipping Address:</h3>
                    <p style="margin: 0; font-size: 0.9em; line-height: 1.5;">
                        ${order.address.street}<br>
                        ${order.address.city}, ${order.address.state} - ${order.address.zipCode}
                    </p>
                </div>
                
                <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                    Payment Method: <span style="text-transform: uppercase; font-weight: bold;">${order.paymentMethod || 'cod'}</span>
                </p>
            </div>
            <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 0.8em; color: #888;">
                This is an automated message from your store. Please do not reply.
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
        console.log('Order notification email sent successfully!');
    } catch (error) {
        console.error('Error sending order notification email:', error);
    }
};

const sendCancellationNotification = async (order) => {
    // Fallback if no credentials provided
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('--------------------------------------------------');
        console.log('LOGGING CANCELLATION (SMTP Credentials Missing)');
        console.log(`To: ${adminEmail}`);
        console.log(`Subject: Order CANCELLED - ID: ${order.id}`);
        console.log(`Content: Customer ${order.address.fullName} cancelled their order of ₹${order.total_amount}`);
        console.log('--------------------------------------------------');
        return;
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #ff4d4d; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">ORDER CANCELLED</h1>
                <p style="margin: 5px 0 0 0; color: #ffe6e6;">Notification for Abbas Threads</p>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #333;">Cancellation Details</h2>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Cancellation Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Customer:</strong> ${order.address.fullName}</p>
                <p><strong>Total Amount Reverted:</strong> ₹${order.total_amount.toLocaleString('en-IN')}</p>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #fff5f5; border-left: 4px solid #ff4d4d;">
                    <p style="margin: 0; font-weight: bold;">Action Required:</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">Please check your inventory as the items from this order have been returned to stock.</p>
                </div>
            </div>
            <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 0.8em; color: #888;">
                This is an automated message from your store.
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `⚠️ Order CANCELLED # ${order.id} - ₹${order.total_amount}`,
            html: htmlContent
        });
        console.log('Cancellation notification email sent successfully!');
    } catch (error) {
        console.error('Error sending cancellation notification email:', error);
    }
};

const sendCustomServiceNotification = async (design) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('--------------------------------------------------');
        console.log('LOGGING CUSTOM DESIGN (SMTP Credentials Missing)');
        console.log(`To: ${adminEmail}`);
        console.log(`Subject: New Custom Design Request - User ID: ${design.userId}`);
        console.log(`Content: Description: ${design.description}`);
        console.log('--------------------------------------------------');
        return;
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">ABBAS THREADS</h1>
                <p style="margin: 5px 0 0 0; color: #aaa;">New Custom Service Request</p>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #333;">Request Details</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>User ID:</strong> ${design.userId}</p>
                <p><strong>Description:</strong> ${design.description || 'No description provided'}</p>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #000;">
                    <p style="margin: 0;"><strong>Note:</strong> The submitted design image is attached to this email.</p>
                </div>
            </div>
            <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 0.8em; color: #888;">
                This is an automated message from your store.
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
                filename: `design_${design.userId}_${Date.now()}.${ext}`,
                content: base64Data,
                encoding: 'base64'
            }];
        } catch (e) {
            console.error('Error attaching image:', e);
        }
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log('Custom design notification email sent successfully!');
    } catch (error) {
        console.error('Error sending custom design notification email:', error);
    }
};

const sendCustomServiceStatusNotification = async (design, status) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('--------------------------------------------------');
        console.log('LOGGING CUSTOM DESIGN STATUS (SMTP Credentials Missing)');
        console.log(`To: ${adminEmail}`);
        console.log(`Subject: Custom Design Status Updated to ${status}`);
        console.log('--------------------------------------------------');
        return;
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #333; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">ABBAS THREADS</h1>
                <p style="margin: 5px 0 0 0; color: #aaa;">Custom Service Request Updated</p>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #333;">Status Update</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Design ID:</strong> ${design.id}</p>
                <p><strong>New Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${status === 'approved' ? 'green' : (status === 'rejected' ? 'red' : 'orange')};">${status}</span></p>
                <p><strong>Description:</strong> ${design.description || 'N/A'}</p>
            </div>
            <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 0.8em; color: #888;">
                This is an automated message from your store.
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `Custom Design Request #${design.id} Status: ${status.toUpperCase()}`,
            html: htmlContent
        });
        console.log('Custom design status email sent successfully!');
    } catch (error) {
        console.error('Error sending custom design status email:', error);
    }
};

module.exports = { 
    sendOrderNotification, 
    sendCancellationNotification,
    sendCustomServiceNotification,
    sendCustomServiceStatusNotification
};
