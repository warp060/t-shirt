// Resend HTTP API - Works on Render (no SMTP needed)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

const sendEmail = async (subject, html, attachments = []) => {
    try {
        console.log(`[MAIL] Sending email: "${subject}" to ${ADMIN_EMAIL}`);
        
        const emailData = {
            from: 'Abbas Threads <onboarding@resend.dev>',
            to: [ADMIN_EMAIL],
            subject: subject,
            html: html,
        };

        if (attachments.length > 0) {
            emailData.attachments = attachments;
            console.log(`[MAIL] Including ${attachments.length} attachment(s)`);
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
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

// Extract base64 content from data URL
const parseDataUrl = (dataUrl) => {
    if (!dataUrl || !dataUrl.startsWith('data:')) return null;
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return null;
    return {
        mimeType: matches[1],
        base64: matches[2],
        extension: matches[1].split('/')[1] || 'png'
    };
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
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Customer:</strong> ${order.address?.fullName || 'N/A'}</p>
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
                                ${order.address?.fullName || ''}<br>
                                ${order.address?.street || order.address?.address || 'N/A'}<br>
                                ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.zipCode || order.address?.pincode || ''}
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
                        <p style="margin: 0 0 15px; font-size: 14px; color: #333;"><strong>Amount:</strong> <span style="font-size: 18px; font-weight: bold; color: #1a1a1a;">₹${order.total_amount || order.totalAmount}</span></p>
                        
                        ${order.cancel_reason ? `
                        <div style="background-color: #fff3f3; border-left: 3px solid #c62828; padding: 12px 15px; margin-bottom: 20px;">
                            <p style="margin: 0 0 5px; font-size: 13px; font-weight: bold; color: #c62828; text-transform: uppercase; letter-spacing: 0.5px;">Customer's Reason</p>
                            <p style="margin: 0; font-size: 14px; color: #333; font-style: italic;">"${order.cancel_reason}"</p>
                        </div>
                        ` : ''}
                    </td></tr>

                    <!-- Shipping Address -->
                    <tr><td style="padding: 0 25px 15px;">
                        <div style="background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px;">
                            <p style="margin: 0 0 5px; font-size: 14px; font-weight: bold; color: #333;">Shipping Address:</p>
                            <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
                                ${order.address?.fullName || ''}<br>
                                ${order.address?.street || order.address?.address || 'N/A'}<br>
                                ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.zipCode || order.address?.pincode || ''}
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
                        <div style="font-size: 13px; color: #cccccc; margin-top: 5px;">New Custom Service Request</div>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding: 25px 25px 10px;">
                        <h2 style="margin: 0 0 20px; font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px;">Request Details</h2>

                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Date:</strong> ${formatDate()}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Customer:</strong> ${user?.name || 'N/A'}</p>
                        <p style="margin: 0 0 20px; font-size: 14px; color: #333;"><strong>Email:</strong> <a href="mailto:${user?.email || ''}" style="color: #1a73e8; text-decoration: none;">${user?.email || 'N/A'}</a></p>

                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Description:</strong> ${design.description || 'No description provided'}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Phone:</strong> ${design.phone || 'No phone provided'}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Address:</strong> ${design.address || 'No address provided'}</p>
                    </td></tr>

                    <!-- Note -->
                    <tr><td style="padding: 0 25px 20px;">
                        <div style="background-color: #f5f5f5; border-left: 3px solid #1a1a1a; padding: 12px 15px;">
                            <p style="margin: 0; font-size: 14px; color: #555;"><strong>Note:</strong> The submitted design image is attached to this email.</p>
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
    
    sendCustomDesignNotification: (design, user) => {
        const html = templates.customDesign(design, user);
        const imageUrl = design.imageUrl || design.image_url || '';
        const attachments = [];

        // If image is a base64 data URL, attach it as a file
        const parsed = parseDataUrl(imageUrl);
        if (parsed) {
            attachments.push({
                filename: `custom-design.${parsed.extension}`,
                content: parsed.base64,
            });
            console.log(`[MAIL] Attaching design image (${parsed.mimeType})`);
        }

        return sendEmail(
            `Custom Design Request from ${user?.name || 'User'} - Abbas Threads`,
            html,
            attachments
        );
    },
};
