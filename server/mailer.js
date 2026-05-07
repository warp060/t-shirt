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
// PREMIUM EMAIL TEMPLATES - Abbas Threads
// ═══════════════════════════════════════════════════

const templates = {

    // ─── NEW ORDER TEMPLATE ────────────────────────
    newOrder: (order, items) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                    
                    <!-- Header with Gold Accent -->
                    <tr><td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #c9a84c;">
                        <div style="font-size: 12px; letter-spacing: 6px; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px;">━━ Abbas Threads ━━</div>
                        <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 300; letter-spacing: 2px;">NEW ORDER RECEIVED</h1>
                        <div style="margin-top: 15px; display: inline-block; background: rgba(201, 168, 76, 0.15); border: 1px solid rgba(201, 168, 76, 0.3); border-radius: 20px; padding: 6px 20px;">
                            <span style="color: #c9a84c; font-size: 14px; letter-spacing: 1px;">Order #${order.id || 'N/A'}</span>
                        </div>
                    </td></tr>

                    <!-- Customer Info Card -->
                    <tr><td style="padding: 30px;">
                        <div style="background: linear-gradient(135deg, #1e1e2e 0%, #252540 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #c9a84c;">
                            <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #888; margin-bottom: 10px;">Customer Details</div>
                            <div style="color: #fff; font-size: 18px; font-weight: 600; margin-bottom: 5px;">👤 ${order.address?.fullName || 'Customer'}</div>
                            <div style="color: #aaa; font-size: 14px;">📱 ${order.address?.phone || 'N/A'}</div>
                        </div>
                    </td></tr>

                    <!-- Order Items -->
                    <tr><td style="padding: 0 30px;">
                        <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #c9a84c; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #2a2a2a;">🛍️ Order Items</div>
                        ${items.map(item => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; margin-bottom: 8px; background: #1a1a2e; border-radius: 10px; border: 1px solid #2a2a3e;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="color: #e0e0e0; font-size: 15px; font-weight: 500;">${item.name || 'Product'}</td>
                                    <td style="text-align: center; color: #888; font-size: 13px; width: 60px;">×${item.quantity}</td>
                                    <td style="text-align: right; color: #c9a84c; font-size: 15px; font-weight: 600; width: 100px;">₹${item.price}</td>
                                </tr>
                            </table>
                        </div>
                        `).join('')}
                    </td></tr>

                    <!-- Total Amount -->
                    <tr><td style="padding: 20px 30px;">
                        <div style="background: linear-gradient(135deg, #c9a84c 0%, #d4af37 50%, #b8962e 100%); border-radius: 12px; padding: 20px; text-align: center;">
                            <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: rgba(0,0,0,0.5); margin-bottom: 5px;">Total Amount</div>
                            <div style="font-size: 32px; font-weight: 700; color: #0a0a0a;">₹${order.totalAmount || order.total_amount}</div>
                        </div>
                    </td></tr>

                    <!-- Shipping Address -->
                    <tr><td style="padding: 0 30px 20px;">
                        <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; border: 1px solid #2a2a3e;">
                            <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #888; margin-bottom: 12px;">📦 Shipping Address</div>
                            <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                                ${order.address?.address || 'N/A'}<br>
                                ${order.address?.city || ''}, ${order.address?.state || ''}<br>
                                <span style="color: #c9a84c; font-weight: 600;">PIN: ${order.address?.pincode || 'N/A'}</span>
                            </div>
                        </div>
                    </td></tr>

                    <!-- Payment Badge -->
                    <tr><td style="padding: 0 30px 25px; text-align: center;">
                        <div style="display: inline-block; background: #1a1a2e; border: 1px solid #2a2a3e; border-radius: 8px; padding: 10px 25px;">
                            <span style="color: #888; font-size: 12px; letter-spacing: 1px;">Payment: </span>
                            <span style="color: #4ade80; font-size: 13px; font-weight: 600; text-transform: uppercase;">${order.paymentMethod || order.payment_method}</span>
                        </div>
                    </td></tr>

                    <!-- CTA Button -->
                    <tr><td style="padding: 0 30px 30px; text-align: center;">
                        <a href="https://abbas-threads.onrender.com" style="display: inline-block; background: linear-gradient(135deg, #c9a84c 0%, #d4af37 100%); color: #0a0a0a; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">View Dashboard →</a>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background: #0a0a0a; padding: 20px 30px; text-align: center; border-top: 1px solid #1a1a1a;">
                        <div style="font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #444;">Abbas Threads</div>
                        <div style="font-size: 11px; color: #333; margin-top: 5px;">Premium Fashion · Automated Notification</div>
                    </td></tr>

                </table>
            </td></tr>
        </table>
    </body>
    </html>
    `,

    // ─── ORDER CANCELLED TEMPLATE ──────────────────
    orderCancelled: (order) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                    
                    <!-- Header - Red Alert -->
                    <tr><td style="background: linear-gradient(135deg, #2d1117 0%, #3d1520 50%, #4a1a28 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #ef4444;">
                        <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
                        <div style="font-size: 12px; letter-spacing: 6px; text-transform: uppercase; color: #ef4444; margin-bottom: 8px;">━━ Alert ━━</div>
                        <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 300; letter-spacing: 2px;">ORDER CANCELLED</h1>
                        <div style="margin-top: 15px; display: inline-block; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 20px; padding: 6px 20px;">
                            <span style="color: #ef4444; font-size: 14px; letter-spacing: 1px;">Order #${order.id}</span>
                        </div>
                    </td></tr>

                    <!-- Cancellation Details -->
                    <tr><td style="padding: 30px;">
                        <div style="background: linear-gradient(135deg, #1e1e2e 0%, #2d1117 100%); border-radius: 12px; padding: 25px; border-left: 4px solid #ef4444;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 8px 0;">
                                        <span style="color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Customer</span><br>
                                        <span style="color: #fff; font-size: 16px; font-weight: 600;">${order.address?.fullName || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-top: 1px solid #2a2a2a;">
                                        <span style="color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Order ID</span><br>
                                        <span style="color: #ef4444; font-size: 16px; font-weight: 600;">#${order.id}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-top: 1px solid #2a2a2a;">
                                        <span style="color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Refund Amount</span><br>
                                        <span style="color: #4ade80; font-size: 22px; font-weight: 700;">₹${order.total_amount || order.totalAmount}</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td></tr>

                    <!-- Stock Restored Notice -->
                    <tr><td style="padding: 0 30px 20px;">
                        <div style="background: rgba(74, 222, 128, 0.08); border: 1px solid rgba(74, 222, 128, 0.2); border-radius: 12px; padding: 16px 20px; text-align: center;">
                            <span style="color: #4ade80; font-size: 14px;">✅ Stock has been automatically restored</span>
                        </div>
                    </td></tr>

                    <!-- CTA Button -->
                    <tr><td style="padding: 0 30px 30px; text-align: center;">
                        <a href="https://abbas-threads.onrender.com" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Review Cancellation →</a>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background: #0a0a0a; padding: 20px 30px; text-align: center; border-top: 1px solid #1a1a1a;">
                        <div style="font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #444;">Abbas Threads</div>
                        <div style="font-size: 11px; color: #333; margin-top: 5px;">Premium Fashion · Automated Alert</div>
                    </td></tr>

                </table>
            </td></tr>
        </table>
    </body>
    </html>
    `,

    // ─── CUSTOM DESIGN REQUEST TEMPLATE ────────────
    customDesign: (design, user) => `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                    
                    <!-- Header - Creative Purple -->
                    <tr><td style="background: linear-gradient(135deg, #1a1033 0%, #2d1b69 50%, #4c1d95 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #a78bfa;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🎨</div>
                        <div style="font-size: 12px; letter-spacing: 6px; text-transform: uppercase; color: #a78bfa; margin-bottom: 8px;">━━ Creative Studio ━━</div>
                        <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 300; letter-spacing: 2px;">CUSTOM DESIGN REQUEST</h1>
                        <div style="margin-top: 15px; display: inline-block; background: rgba(167, 139, 250, 0.15); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 20px; padding: 6px 20px;">
                            <span style="color: #a78bfa; font-size: 14px; letter-spacing: 1px;">New Submission</span>
                        </div>
                    </td></tr>

                    <!-- Customer Info -->
                    <tr><td style="padding: 30px;">
                        <div style="background: linear-gradient(135deg, #1e1e2e 0%, #1a1033 100%); border-radius: 12px; padding: 20px; border-left: 4px solid #a78bfa;">
                            <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #888; margin-bottom: 12px;">👤 Customer Info</div>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 6px 0;">
                                        <span style="color: #666; font-size: 12px;">Name</span><br>
                                        <span style="color: #fff; font-size: 16px; font-weight: 600;">${user?.name || 'N/A'}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; border-top: 1px solid #2a2a2a;">
                                        <span style="color: #666; font-size: 12px;">Email</span><br>
                                        <a href="mailto:${user?.email || ''}" style="color: #a78bfa; font-size: 15px; text-decoration: none;">${user?.email || 'N/A'}</a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td></tr>

                    <!-- Design Description -->
                    <tr><td style="padding: 0 30px 20px;">
                        <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #a78bfa; margin-bottom: 12px;">💬 Design Brief</div>
                        <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; border: 1px solid #2a2a3e; position: relative;">
                            <div style="color: #a78bfa; font-size: 40px; opacity: 0.2; position: absolute; top: 5px; left: 15px;">"</div>
                            <p style="color: #ccc; font-size: 15px; line-height: 1.7; margin: 0; padding-left: 10px; font-style: italic;">
                                ${design.description || 'No description provided.'}
                            </p>
                        </div>
                    </td></tr>

                    <!-- Design Image -->
                    <tr><td style="padding: 0 30px 25px;">
                        <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #a78bfa; margin-bottom: 12px;">🖼️ Uploaded Design</div>
                        <div style="background: #1a1a2e; border-radius: 12px; padding: 12px; border: 1px solid #2a2a3e; text-align: center;">
                            <img src="${design.imageUrl || design.image_url}" alt="Custom Design" style="max-width: 100%; border-radius: 8px; display: block; margin: 0 auto;">
                        </div>
                    </td></tr>

                    <!-- CTA Button -->
                    <tr><td style="padding: 0 30px 30px; text-align: center;">
                        <a href="https://abbas-threads.onrender.com" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Review Design →</a>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background: #0a0a0a; padding: 20px 30px; text-align: center; border-top: 1px solid #1a1a1a;">
                        <div style="font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #444;">Abbas Threads</div>
                        <div style="font-size: 11px; color: #333; margin-top: 5px;">Premium Fashion · Creative Studio</div>
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
        sendEmail(`🛍️ New Order Alert: #${order.id || 'Pending'}`, templates.newOrder(order, items)),
    
    sendCancellationNotification: (order) => 
        sendEmail(`⚠️ Order Cancelled: #${order.id}`, templates.orderCancelled(order)),
    
    sendCustomDesignNotification: (design, user) => 
        sendEmail(`🎨 Custom Design Request from ${user?.name || 'User'}`, templates.customDesign(design, user)),
};
