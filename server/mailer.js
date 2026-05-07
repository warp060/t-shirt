const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

const sendEmail = async (subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Abbas Threads" <${process.env.EMAIL_USER}>`,
            to: ADMIN_EMAIL,
            subject: subject,
            html: html,
        });
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const templates = {
    newOrder: (order, items) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">New Order Received!</h1>
                <p style="margin: 5px 0 0; opacity: 0.8;">Order #${order.id || 'N/A'}</p>
            </div>
            <div style="padding: 20px; color: #333;">
                <p>Hello Admin, you have a new order from <strong>${order.address?.fullName || 'Customer'}</strong>.</p>
                
                <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f8f8f8;">
                            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Item</th>
                            <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">Qty</th>
                            <th style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name || 'Product'}</td>
                                <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                                <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold; color: #e67e22;">₹${order.totalAmount || order.total_amount}</td>
                        </tr>
                    </tfoot>
                </table>

                <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-top: 20px;">Shipping Details</h3>
                <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; line-height: 1.6;">
                    <strong>Name:</strong> ${order.address?.fullName}<br>
                    <strong>Phone:</strong> ${order.address?.phone}<br>
                    <strong>Address:</strong> ${order.address?.address}, ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}
                </p>

                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                    Payment Method: <span style="text-transform: uppercase;">${order.paymentMethod || order.payment_method}</span>
                </p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://abbas-threads.render.com/admin/orders" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Admin Panel</a>
                </div>
            </div>
            <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                &copy; 2024 Abbas Threads | Automated Notification
            </div>
        </div>
    `,
    orderCancelled: (order) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #e74c3c; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Order Cancelled</h1>
                <p style="margin: 5px 0 0; opacity: 0.8;">Order #${order.id}</p>
            </div>
            <div style="padding: 20px; color: #333;">
                <p>The following order has been <strong>CANCELLED</strong>.</p>
                <div style="background: #fff5f5; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0;">
                    <strong>Order ID:</strong> ${order.id}<br>
                    <strong>Customer:</strong> ${order.address?.fullName || 'N/A'}<br>
                    <strong>Total Amount:</strong> ₹${order.total_amount || order.totalAmount}
                </div>
                <p>Stock has been automatically restored for the items in this order.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://abbas-threads.render.com/admin/orders" style="background-color: #e74c3c; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Check Order Details</a>
                </div>
            </div>
        </div>
    `,
    customDesign: (design, user) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%); color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">New Custom Design Request!</h1>
            </div>
            <div style="padding: 20px; color: #333;">
                <p>A user has submitted a new custom design request.</p>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0;">Customer Info</h3>
                    <strong>Name:</strong> ${user?.name || 'N/A'}<br>
                    <strong>Email:</strong> ${user?.email || 'N/A'}<br>
                </div>

                <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Design Description</h3>
                <p style="font-style: italic; color: #555; background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 5px;">
                    "${design.description || 'No description provided.'}"
                </p>

                <h3 style="border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-top: 20px;">Design Image</h3>
                <div style="text-align: center; padding: 10px; background: #eee; border-radius: 5px;">
                    <img src="${design.imageUrl || design.image_url}" alt="Custom Design" style="max-width: 100%; border-radius: 5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://abbas-threads.render.com/admin/custom-designs" style="background-color: #6c5ce7; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage Request</a>
                </div>
            </div>
        </div>
    `
};

module.exports = {
    sendOrderNotification: (order, items) => 
        sendEmail(`New Order Alert: #${order.id || 'Pending'}`, templates.newOrder(order, items)),
    
    sendCancellationNotification: (order) => 
        sendEmail(`Order Cancelled: #${order.id}`, templates.orderCancelled(order)),
    
    sendCustomDesignNotification: (design, user) => 
        sendEmail(`New Custom Design Request from ${user?.name || 'User'}`, templates.customDesign(design, user)),
};
