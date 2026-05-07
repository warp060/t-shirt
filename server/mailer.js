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

// ═══════════════════════════════════════════════════
// CLEAN, PROFESSIONAL EMAIL TEMPLATES
// ═══════════════════════════════════════════════════

const templates = {

    // ─── NEW ORDER ─────────────────────────────────
    newOrder: (order, items) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 30px 15px;">
            <tr><td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
                    
                    <!-- Top Bar -->
                    <tr><td style="background-color: #111111; padding: 20px 30px; text-align: center;">
                        <span style="color: #ffffff; font-size: 18px; font-weight: 600; letter-spacing: 1.5px;">ABBAS THREADS</span>
                    </td></tr>

                    <!-- Status Banner -->
                    <tr><td style="background-color: #e8f5e9; padding: 16px 30px; border-bottom: 1px solid #c8e6c9;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="font-size: 15px; color: #2e7d32; font-weight: 600;">✓ New Order Placed</td>
                                <td style="text-align: right; font-size: 13px; color: #555;">Order #${order.id || 'N/A'}</td>
                            </tr>
                        </table>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding: 25px 30px;">

                        <!-- Customer -->
                        <p style="margin: 0 0 3px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Customer</p>
                        <p style="margin: 0 0 5px; font-size: 16px; color: #111; font-weight: 600;">${order.address?.fullName || 'Customer'}</p>
                        <p style="margin: 0 0 20px; font-size: 14px; color: #555;">${order.address?.phone || ''}</p>

                        <!-- Items Table -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                            <tr style="border-bottom: 2px solid #111;">
                                <td style="padding: 8px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #111;">Item</td>
                                <td style="padding: 8px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; border-bottom: 2px solid #111;">Qty</td>
                                <td style="padding: 8px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border-bottom: 2px solid #111;">Price</td>
                            </tr>
                            ${items.map(item => `
                            <tr>
                                <td style="padding: 12px 0; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">${item.name || 'Product'}</td>
                                <td style="padding: 12px 0; font-size: 14px; color: #333; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                                <td style="padding: 12px 0; font-size: 14px; color: #333; text-align: right; border-bottom: 1px solid #eee; font-weight: 600;">₹${item.price}</td>
                            </tr>
                            `).join('')}
                            <tr>
                                <td colspan="2" style="padding: 14px 0; font-size: 15px; color: #111; font-weight: 700; text-align: right;">Total</td>
                                <td style="padding: 14px 0; font-size: 18px; color: #111; text-align: right; font-weight: 700;">₹${order.totalAmount || order.total_amount}</td>
                            </tr>
                        </table>

                        <!-- Divider -->
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                        <!-- Shipping & Payment -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="vertical-align: top; width: 60%;">
                                    <p style="margin: 0 0 3px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</p>
                                    <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
                                        ${order.address?.fullName || ''}<br>
                                        ${order.address?.address || ''}<br>
                                        ${order.address?.city || ''}, ${order.address?.state || ''} ${order.address?.pincode || ''}
                                    </p>
                                </td>
                                <td style="vertical-align: top; text-align: right;">
                                    <p style="margin: 0 0 3px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Payment</p>
                                    <span style="display: inline-block; background: #f0f0f0; padding: 5px 14px; border-radius: 4px; font-size: 13px; color: #333; font-weight: 600; text-transform: uppercase;">${order.paymentMethod || order.payment_method}</span>
                                </td>
                            </tr>
                        </table>

                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background-color: #fafafa; padding: 18px 30px; border-top: 1px solid #eee; text-align: center;">
                        <span style="font-size: 12px; color: #999;">This is an automated notification from Abbas Threads</span>
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
    <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 30px 15px;">
            <tr><td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
                    
                    <!-- Top Bar -->
                    <tr><td style="background-color: #111111; padding: 20px 30px; text-align: center;">
                        <span style="color: #ffffff; font-size: 18px; font-weight: 600; letter-spacing: 1.5px;">ABBAS THREADS</span>
                    </td></tr>

                    <!-- Status Banner -->
                    <tr><td style="background-color: #fce4ec; padding: 16px 30px; border-bottom: 1px solid #f8bbd0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="font-size: 15px; color: #c62828; font-weight: 600;">✕ Order Cancelled</td>
                                <td style="text-align: right; font-size: 13px; color: #555;">Order #${order.id}</td>
                            </tr>
                        </table>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding: 25px 30px;">

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                    <span style="font-size: 13px; color: #888;">Customer</span><br>
                                    <span style="font-size: 15px; color: #111; font-weight: 600;">${order.address?.fullName || 'N/A'}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                    <span style="font-size: 13px; color: #888;">Order ID</span><br>
                                    <span style="font-size: 15px; color: #111; font-weight: 600;">#${order.id}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                    <span style="font-size: 13px; color: #888;">Amount</span><br>
                                    <span style="font-size: 20px; color: #111; font-weight: 700;">₹${order.total_amount || order.totalAmount}</span>
                                </td>
                            </tr>
                        </table>

                        <!-- Stock Notice -->
                        <div style="background-color: #e8f5e9; border-left: 3px solid #4caf50; padding: 12px 16px; border-radius: 0 4px 4px 0; margin-top: 10px;">
                            <span style="font-size: 14px; color: #2e7d32;">✓ Stock has been automatically restored for this order.</span>
                        </div>

                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background-color: #fafafa; padding: 18px 30px; border-top: 1px solid #eee; text-align: center;">
                        <span style="font-size: 12px; color: #999;">This is an automated notification from Abbas Threads</span>
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
    <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 30px 15px;">
            <tr><td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
                    
                    <!-- Top Bar -->
                    <tr><td style="background-color: #111111; padding: 20px 30px; text-align: center;">
                        <span style="color: #ffffff; font-size: 18px; font-weight: 600; letter-spacing: 1.5px;">ABBAS THREADS</span>
                    </td></tr>

                    <!-- Status Banner -->
                    <tr><td style="background-color: #ede7f6; padding: 16px 30px; border-bottom: 1px solid #d1c4e9;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="font-size: 15px; color: #4527a0; font-weight: 600;">🎨 New Custom Design Request</td>
                            </tr>
                        </table>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding: 25px 30px;">

                        <!-- Customer Info -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                    <span style="font-size: 13px; color: #888;">Customer Name</span><br>
                                    <span style="font-size: 15px; color: #111; font-weight: 600;">${user?.name || 'N/A'}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                    <span style="font-size: 13px; color: #888;">Email</span><br>
                                    <a href="mailto:${user?.email || ''}" style="font-size: 15px; color: #1a73e8; text-decoration: none;">${user?.email || 'N/A'}</a>
                                </td>
                            </tr>
                        </table>

                        <!-- Design Description -->
                        <p style="margin: 0 0 6px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Design Description</p>
                        <div style="background-color: #f8f9fa; border: 1px solid #e8e8e8; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                            <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">${design.description || 'No description provided.'}</p>
                        </div>

                        <!-- Design Image -->
                        <p style="margin: 0 0 6px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Uploaded Design</p>
                        <div style="border: 1px solid #e8e8e8; border-radius: 6px; overflow: hidden; text-align: center; background: #fafafa;">
                            <img src="${design.imageUrl || design.image_url}" alt="Custom Design" style="max-width: 100%; display: block; margin: 0 auto;">
                        </div>

                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background-color: #fafafa; padding: 18px 30px; border-top: 1px solid #eee; text-align: center;">
                        <span style="font-size: 12px; color: #999;">This is an automated notification from Abbas Threads</span>
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
