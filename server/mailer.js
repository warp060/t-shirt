const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

const sendEmail = async (subject, html, attachments = []) => {
    try {
        console.log(`[MAIL] Sending email: "${subject}" to ${ADMIN_EMAIL}`);
        
        const mailOptions = {
            from: `"Abbas Threads" <${EMAIL_USER}>`,
            to: ADMIN_EMAIL,
            subject: subject,
            html: html,
        };

        if (attachments.length > 0) {
            mailOptions.attachments = attachments.map(att => ({
                filename: att.filename,
                content: att.content,
                encoding: 'base64'
            }));
            console.log(`[MAIL] Including ${attachments.length} attachment(s)`);
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`[MAIL] ✅ Email sent successfully! ID: ${info.messageId}`);
        return true;
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
                                <td style="padding: 10px 0; font-size: 14px; color: #333; border-bottom: 1px solid #eee; vertical-align: middle;">
                                    <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                        <tr>
                                            ${item.image_url ? `
                                            <td style="padding-right: 12px; vertical-align: middle;">
                                                <img src="${item.image_url}" width="45" height="45" style="border-radius: 4px; object-fit: cover; border: 1px solid #e0e0e0; display: block;" alt="${item.name || 'Product'}" />
                                            </td>
                                            ` : ''}
                                            <td style="vertical-align: middle;">
                                                <span style="font-weight: 500; color: #1a1a1a;">${item.name || 'Product'}</span>
                                                <br/>
                                                <span style="font-size: 12px; color: #777;">Qty: ${item.quantity}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td style="padding: 10px 0; font-size: 14px; color: #333; text-align: right; border-bottom: 1px solid #eee; vertical-align: middle; font-weight: bold;">₹${item.price}</td>
                            </tr>
                            `).join('')}
                            <tr>
                                <td style="padding: 12px 0; font-size: 15px; color: #1a1a1a; font-weight: bold; vertical-align: middle;">Total Amount</td>
                                <td style="padding: 12px 0; font-size: 16px; color: #1a1a1a; text-align: right; font-weight: bold; vertical-align: middle;">₹${order.totalAmount || order.total_amount}</td>
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
    orderCancelled: (order, items = []) => `
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

                    ${items && items.length > 0 ? `
                    <!-- Cancelled Items -->
                    <tr><td style="padding: 0 25px 15px;">
                        <h3 style="margin: 0 0 10px; font-size: 14px; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Cancelled Items</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 5px;">
                            ${items.map(item => `
                            <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; border-bottom: 1px solid #eee; vertical-align: middle;">
                                    <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                        <tr>
                                            ${item.image_url ? `
                                            <td style="padding-right: 12px; vertical-align: middle;">
                                                <img src="${item.image_url}" width="45" height="45" style="border-radius: 4px; object-fit: cover; border: 1px solid #e0e0e0; display: block;" alt="${item.name || 'Product'}" />
                                            </td>
                                            ` : ''}
                                            <td style="vertical-align: middle;">
                                                <span style="font-weight: 500; color: #1a1a1a;">${item.name || 'Product'}</span>
                                                <br/>
                                                <span style="font-size: 12px; color: #777;">Qty: ${item.quantity}</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333; text-align: right; border-bottom: 1px solid #eee; vertical-align: middle; font-weight: bold;">₹${item.price}</td>
                            </tr>
                            `).join('')}
                        </table>
                    </td></tr>
                    ` : ''}

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
    `,

    // ─── CUSTOM DESIGN CANCELLED ──────────────────
    customDesignCancelled: (design, user) => `
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
                        <div style="font-size: 13px; color: #cccccc; margin-top: 5px;">Custom Service Cancellation Notice</div>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding: 25px 25px 10px;">
                        <h2 style="margin: 0 0 20px; font-size: 18px; color: #c62828; border-bottom: 2px solid #c62828; padding-bottom: 8px;">Custom Design Cancelled</h2>

                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Date:</strong> ${formatDate()}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Customer:</strong> ${user?.name || 'N/A'}</p>
                        <p style="margin: 0 0 20px; font-size: 14px; color: #333;"><strong>Email:</strong> <a href="mailto:${user?.email || ''}" style="color: #1a73e8; text-decoration: none;">${user?.email || 'N/A'}</a></p>

                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Description:</strong> ${design.description || 'No description provided'}</p>
                        <p style="margin: 0 0 8px; font-size: 14px; color: #333;"><strong>Phone:</strong> ${design.phone || 'No phone provided'}</p>
                        <p style="margin: 0 0 20px; font-size: 14px; color: #333;"><strong>Address:</strong> ${design.address || 'No address provided'}</p>
                        
                        ${design.cancel_reason ? `
                        <div style="background-color: #fff3f3; border-left: 3px solid #c62828; padding: 12px 15px; margin-bottom: 20px;">
                            <p style="margin: 0 0 5px; font-size: 13px; font-weight: bold; color: #c62828; text-transform: uppercase; letter-spacing: 0.5px;">Customer's Reason</p>
                            <p style="margin: 0; font-size: 14px; color: #333; font-style: italic;">"${design.cancel_reason}"</p>
                        </div>
                        ` : ''}
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
    
    sendCancellationNotification: (order, items) => 
        sendEmail(`Order #${order.id} Cancelled - Abbas Threads`, templates.orderCancelled(order, items)),
    
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

    sendCustomDesignCancellationNotification: (design, user) => {
        const html = templates.customDesignCancelled(design, user);
        const imageUrl = design.imageUrl || design.image_url || '';
        const attachments = [];

        const parsed = parseDataUrl(imageUrl);
        if (parsed) {
            attachments.push({
                filename: `custom-design.${parsed.extension}`,
                content: parsed.base64,
            });
            console.log(`[MAIL] Attaching design image (${parsed.mimeType}) for cancellation`);
        }

        return sendEmail(
            `Custom Design Request CANCELLED by ${user?.name || 'User'} - Abbas Threads`,
            html,
            attachments
        );
    },
};
