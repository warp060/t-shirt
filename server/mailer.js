// Resend HTTP API - Works on Render (no SMTP needed)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

const sendEmail = async (subject, html) => {
    try {
        console.log(`[MAIL] Sending email: "${subject}" to ${ADMIN_EMAIL}`);
        
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Abbas Threads <onboarding@resend.dev>',
                to: [ADMIN_EMAIL],
                subject: subject,
                html: html,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`[MAIL] ✅ Email sent successfully! ID: ${data.id}`);
            return true;
        } else {
            console.error(`[MAIL] ❌ Resend API error:`, data);
            return false;
        }
    } catch (error) {
        console.error('[MAIL] ❌ Error sending email:', error);
        return false;
    }
};

const formatDate = () => {
    const now = new Date();
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
    return now.toLocaleString('en-IN', options);
};

// ═══════════════════════════════════════════════════
// CLEAN EMAIL TEMPLATES - Abbas Threads
// ═══════════════════════════════════════════════════

const templates = {

    // ─── NEW ORDER ─────────────────────────────────
    newOrder: (order, items) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f2f2f2; font-family: Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2; padding: 20px;">
            <tr><td align="center">
                <table width="500" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border: 1px solid #ddd;">
                    
                    <!-- Header -->
                    <tr><td style="background-color: #1a1a1a; padding: 25px 20px; text-align: center;">
                        <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">ABBAS THREADS</div>
                        <div style="font-size: 13px; color: #cccccc; margin-top: 5px;">New Order Notification</div>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding: 25px 25px 10px;">
                        <h2 style="margin: 0 0 20px; font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px;">Order Details</h2>

                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Order ID:</strong> ${order.id || 'N/A'}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Date:</strong> ${formatDate()}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Customer:</strong> ${order.address?.fullName || 'N/A'} (${order.address?.email || ADMIN_EMAIL})</p>
                        <p style="margin: 0 0 20px; font-size: 14px; color: #333;"><strong>Phone:</strong> ${order.address?.phone || 'N/A'}</p>

                        <!-- Items -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 5px;">
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd;">Item</td>
                                <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #333; text-align: right; border-bottom: 1px solid #ddd;">Price</td>
                            </tr>
                            ${items.map(item => `
                            <tr>
                                <td style="padding: 10px 0; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">${item.name || 'Product'} x ${item.quantity}</td>
                                <td style="padding: 10px 0; font-size: 14px; color: #333; text-align: right; border-bottom: 1px solid #eee;">₹${item.price}</td>
                            </tr>
                            `).join('')}
                            <tr>
                                <td style="padding: 12px 0; font-size: 15px; color: #1a1a1a; font-weight: bold;">Total Amount</td>
                                <td style="padding: 12px 0; font-size: 16px; color: #1a1a1a; text-align: right; font-weight: bold;">₹${order.totalAmount || order.total_amount}</td>
                            </tr>
                        </table>
                    </td></tr>

                    <!-- Shipping Address -->
                    <tr><td style="padding: 10px 25px 15px;">
                        <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px;">
                            <p style="margin: 0 0 5px; font-size: 14px; font-weight: bold; color: #333;">Shipping Address:</p>
                            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
                                ${order.address?.address || 'N/A'}<br>
                                ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pincode || ''}
                            </p>
                        </div>
                    </td></tr>

                    <!-- Payment Method -->
                    <tr><td style="padding: 0 25px 20px;">
                        <p style="margin: 0; font-size: 14px; color: #333;">Payment Method: <strong style="text-transform: uppercase;">${order.paymentMethod || order.payment_method}</strong></p>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background-color: #fafafa; padding: 15px 25px; border-top: 1px solid #eee; text-align: center;">
                        <p style="margin: 0; font-size: 11px; color: #999;">This is an automated email from Abbas Threads. Please do not reply.</p>
                    </td></tr>

                </table>
            </td></tr>
        </table>
    </body>
    </html>
    `,

    // ─── ORDER CANCELLED ───────────────────────────
    orderCancelled: (order) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f2f2f2; font-family: Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2; padding: 20px;">
            <tr><td align="center">
                <table width="500" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border: 1px solid #ddd;">
                    
                    <!-- Header -->
                    <tr><td style="background-color: #1a1a1a; padding: 25px 20px; text-align: center;">
                        <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">ABBAS THREADS</div>
                        <div style="font-size: 13px; color: #cccccc; margin-top: 5px;">Order Cancellation Notice</div>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding: 25px 25px 10px;">
                        <h2 style="margin: 0 0 20px; font-size: 18px; color: #c62828; border-bottom: 2px solid #c62828; padding-bottom: 8px;">Order Cancelled</h2>

                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Order ID:</strong> #${order.id}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Date:</strong> ${formatDate()}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Customer:</strong> ${order.address?.fullName || 'N/A'}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Phone:</strong> ${order.address?.phone || 'N/A'}</p>
                        <p style="margin: 0 0 20px; font-size: 14px; color: #333;"><strong>Amount:</strong> <span style="font-size: 18px; font-weight: bold; color: #1a1a1a;">₹${order.total_amount || order.totalAmount}</span></p>
                    </td></tr>

                    <!-- Shipping Address -->
                    <tr><td style="padding: 0 25px 15px;">
                        <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px;">
                            <p style="margin: 0 0 5px; font-size: 14px; font-weight: bold; color: #333;">Shipping Address:</p>
                            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
                                ${order.address?.address || 'N/A'}<br>
                                ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pincode || ''}
                            </p>
                        </div>
                    </td></tr>

                    <!-- Stock Notice -->
                    <tr><td style="padding: 0 25px 20px;">
                        <div style="background-color: #e8f5e9; border-left: 3px solid #4caf50; padding: 12px 15px;">
                            <p style="margin: 0; font-size: 14px; color: #2e7d32;">✓ Stock has been automatically restored for this order.</p>
                        </div>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background-color: #fafafa; padding: 15px 25px; border-top: 1px solid #eee; text-align: center;">
                        <p style="margin: 0; font-size: 11px; color: #999;">This is an automated email from Abbas Threads. Please do not reply.</p>
                    </td></tr>

                </table>
            </td></tr>
        </table>
    </body>
    </html>
    `,

    // ─── CUSTOM DESIGN REQUEST ─────────────────────
    customDesign: (design, user) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f2f2f2; font-family: Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f2f2f2; padding: 20px;">
            <tr><td align="center">
                <table width="500" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border: 1px solid #ddd;">
                    
                    <!-- Header -->
                    <tr><td style="background-color: #1a1a1a; padding: 25px 20px; text-align: center;">
                        <div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">ABBAS THREADS</div>
                        <div style="font-size: 13px; color: #cccccc; margin-top: 5px;">Custom Design Request</div>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding: 25px 25px 10px;">
                        <h2 style="margin: 0 0 20px; font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px;">Design Request Details</h2>

                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Date:</strong> ${formatDate()}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Customer:</strong> ${user?.name || 'N/A'}</p>
                        <p style="margin: 0 0 20px; font-size: 14px; color: #333;"><strong>Email:</strong> <a href="mailto:${user?.email || ''}" style="color: #1a73e8; text-decoration: none;">${user?.email || 'N/A'}</a></p>
                    </td></tr>

                    <!-- Description -->
                    <tr><td style="padding: 0 25px 15px;">
                        <p style="margin: 0 0 8px; font-size: 14px; font-weight: bold; color: #333;">Design Description:</p>
                        <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px;">
                            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">${design.description || 'No description provided.'}</p>
                        </div>
                    </td></tr>

                    <!-- Design Image -->
                    <tr><td style="padding: 0 25px 20px;">
                        <p style="margin: 0 0 8px; font-size: 14px; font-weight: bold; color: #333;">Uploaded Design:</p>
                        <div style="border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; text-align: center;">
                            <img src="${design.imageUrl || design.image_url}" alt="Custom Design" style="max-width: 100%; display: block; margin: 0 auto;">
                        </div>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background-color: #fafafa; padding: 15px 25px; border-top: 1px solid #eee; text-align: center;">
                        <p style="margin: 0; font-size: 11px; color: #999;">This is an automated email from Abbas Threads. Please do not reply.</p>
                    </td></tr>

                </table>
            </td></tr>
        </table>
    </body>
    </html>
    `
};

module.exports = {
    sendOrderNotification: (order, items) => 
        sendEmail(`New Order #${order.id || 'Pending'} - Abbas Threads`, templates.newOrder(order, items)),
    
    sendCancellationNotification: (order) => 
        sendEmail(`Order #${order.id} Cancelled - Abbas Threads`, templates.orderCancelled(order)),
    
    sendCustomDesignNotification: (design, user) => 
        sendEmail(`Custom Design Request from ${user?.name || 'User'} - Abbas Threads`, templates.customDesign(design, user)),
};
