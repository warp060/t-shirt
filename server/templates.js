/**
 * Email templates for Abbas Threads admin notifications.
 * Clean, professional, and mobile-responsive HTML.
 */

const primaryColor = '#1a1a1a'; // Dark/Black theme
const accentColor = '#e11d48';  // Deep red accent
const textColor = '#333333';
const mutedColor = '#666666';
const backgroundColor = '#f4f4f5';

const baseStyles = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: ${textColor};
    background-color: ${backgroundColor};
    margin: 0;
    padding: 0;
`;

const containerStyles = `
    max-width: 600px;
    margin: 20px auto;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const headerStyles = `
    background-color: ${primaryColor};
    color: #ffffff;
    padding: 30px;
    text-align: center;
`;

const contentStyles = `
    padding: 30px;
`;

const footerStyles = `
    background-color: #f9fafb;
    padding: 20px;
    text-align: center;
    font-size: 12px;
    color: ${mutedColor};
    border-top: 1px solid #eeeeee;
`;

const tableStyles = `
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
`;

const thStyles = `
    text-align: left;
    border-bottom: 2px solid #eeeeee;
    padding: 10px;
    font-size: 14px;
    color: ${mutedColor};
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const tdStyles = `
    padding: 12px 10px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 15px;
`;

const badgeStyles = (color) => `
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    background-color: ${color}20;
    color: ${color};
`;

const getOrderTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles}">
    <div style="${containerStyles}">
        <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 24px;">New Order Received</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Order #${order.id}</p>
        </div>
        
        <div style="${contentStyles}">
            <div style="margin-bottom: 30px;">
                <h2 style="font-size: 18px; border-left: 4px solid ${accentColor}; padding-left: 10px; margin-bottom: 15px;">Customer Details</h2>
                <p style="margin: 5px 0;"><strong>Name:</strong> ${order.address.fullName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${order.address.email}</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.address.phone || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.zipCode}</p>
                <p style="margin: 5px 0;"><strong>Payment Method:</strong> <span style="${badgeStyles(accentColor)}">${order.paymentMethod || 'COD'}</span></p>
            </div>

            <div>
                <h2 style="font-size: 18px; border-left: 4px solid ${accentColor}; padding-left: 10px; margin-bottom: 15px;">Order Items</h2>
                <table style="${tableStyles}">
                    <thead>
                        <tr>
                            <th style="${thStyles}">Product</th>
                            <th style="${thStyles}">Qty</th>
                            <th style="${thStyles}; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td style="${tdStyles}">${item.name}</td>
                                <td style="${tdStyles}">${item.quantity}</td>
                                <td style="${tdStyles}; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="${tdStyles}; font-weight: bold; font-size: 18px; padding-top: 20px;">Total Amount</td>
                            <td style="${tdStyles}; font-weight: bold; font-size: 18px; text-align: right; padding-top: 20px; color: ${accentColor};">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
                <a href="https://abbas-threads.onrender.com/admin" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">Manage Order</a>
            </div>
        </div>
        
        <div style="${footerStyles}">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Abbas Threads. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated notification for internal use only.</p>
        </div>
    </div>
</body>
</html>
`;

const getCancellationTemplate = (order) => `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
    <div style="${containerStyles}">
        <div style="${headerStyles}; background-color: ${accentColor};">
            <h1 style="margin: 0; font-size: 24px;">Order Cancelled</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Order #${order.id}</p>
        </div>
        
        <div style="${contentStyles}">
            <p style="font-size: 16px;">The following order has been cancelled by the customer or admin.</p>
            
            <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Customer:</strong> ${order.address.fullName}</p>
                <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${(parseFloat(order.total_amount) || 0).toLocaleString('en-IN')}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${accentColor}; font-weight: bold;">CANCELLED</span></p>
            </div>
            
            <p style="color: ${mutedColor}; font-size: 14px;">Please review the inventory if items were returned to stock.</p>
            
            <div style="margin-top: 30px; text-align: center;">
                <a href="https://abbas-threads.onrender.com/admin" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">View Admin Dashboard</a>
            </div>
        </div>
        
        <div style="${footerStyles}">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Abbas Threads. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const getCustomDesignTemplate = (design) => `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
    <div style="${containerStyles}">
        <div style="${headerStyles}; background-color: #4f46e5;">
            <h1 style="margin: 0; font-size: 24px;">Custom Design Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">User ID: ${design.userId}</p>
        </div>
        
        <div style="${contentStyles}">
            <h2 style="font-size: 18px; border-left: 4px solid #4f46e5; padding-left: 10px; margin-bottom: 15px;">Request Details</h2>
            <p style="margin: 15px 0;"><strong>Description:</strong></p>
            <div style="background-color: #f9fafb; border-radius: 5px; padding: 15px; font-style: italic; color: ${textColor};">
                "${design.description || 'No description provided.'}"
            </div>
            
            ${design.imageUrl ? `
            <div style="margin: 25px 0;">
                <p style="margin-bottom: 10px;"><strong>Design Preview:</strong></p>
                <img src="${design.imageUrl}" alt="Design" style="max-width: 100%; border-radius: 8px; border: 1px solid #eeeeee;">
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; text-align: center;">
                <a href="https://abbas-threads.onrender.com/admin" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">View in Admin Panel</a>
            </div>
        </div>
        
        <div style="${footerStyles}">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Abbas Threads. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const getCustomStatusTemplate = (design, status) => `
<!DOCTYPE html>
<html>
<body style="${baseStyles}">
    <div style="${containerStyles}">
        <div style="${headerStyles}; background-color: #0891b2;">
            <h1 style="margin: 0; font-size: 24px;">Custom Design Update</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8;">Status Changed to: ${status}</p>
        </div>
        
        <div style="${contentStyles}">
            <p>The status of a custom design request has been updated.</p>
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Design ID:</strong> ${design.id}</p>
                <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="color: #0891b2; font-weight: bold; text-transform: uppercase;">${status}</span></p>
            </div>
        </div>
        
        <div style="${footerStyles}">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Abbas Threads. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    getOrderTemplate,
    getCancellationTemplate,
    getCustomDesignTemplate,
    getCustomStatusTemplate
};
