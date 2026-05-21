/**
 * Backend Email Service for Server.js
 * Used for sending payment confirmation and generation emails
 */

async function sendEmail(to, subject, html) {
  try {
    // Detect which provider to use based on environment variables
    // Priority: SMTP > SendGrid > Resend
    if (process.env.SMTP_HOST) {
      return await sendViaSMTP(to, subject, html);
    } else if (process.env.SENDGRID_API_KEY) {
      return await sendViaSendGrid(to, subject, html);
    } else if (process.env.RESEND_API_KEY) {
      return await sendViaResend(to, subject, html);
    } else {
      console.warn('⚠️ No email provider configured. Email not sent.');
      return false;
    }
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return false;
  }
}

/**
 * Send via Resend API
 */
async function sendViaResend(to, subject, html) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@vibecoder.com',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Email sent via Resend:`, data.id);
    return true;
  } catch (error) {
    console.error('❌ Resend error:', error.message);
    return false;
  }
}

/**
 * Send via SendGrid API
 */
async function sendViaSendGrid(to, subject, html) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@vibecoder.com' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    console.log(`✅ Email sent via SendGrid to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ SendGrid error:', error.message);
    return false;
  }
}

/**
 * Send via SMTP (using Nodemailer)
 */
async function sendViaSMTP(to, subject, html) {
  try {
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@vibecoder.com',
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent via SMTP to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ SMTP error:', error.message);
    return false;
  }
}

/**
 * Send Payment Confirmation Email
 */
async function sendPaymentConfirmation(email, amount, credits, creditsPackage = 'Credits') {
  const amountFormatted = (amount / 100).toFixed(2);
  const packageName = creditsPackage.charAt(0).toUpperCase() + creditsPackage.slice(1);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .amount { font-size: 32px; font-weight: bold; color: #667eea; }
          .credits { font-size: 24px; font-weight: bold; color: #28a745; margin: 10px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Payment Successful!</h1>
          </div>
          
          <div class="content">
            <p>Dear Valued Customer,</p>
            
            <p>Your payment has been processed successfully! Here's a summary:</p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; text-align: center;">
              <p style="color: #999; margin: 0;">Amount Paid</p>
              <div class="amount">$${amountFormatted}</div>
              
              <p style="color: #999; margin: 10px 0 0 0;">Credits Added</p>
              <div class="credits">+ ${credits.toLocaleString()} Credits</div>
              
              <p style="color: #999; margin: 10px 0 0 0;">Package</p>
              <p style="margin: 0;">${packageName}</p>
            </div>
            
            <p style="margin-top: 20px;">You can now use these credits to generate amazing apps with Workshop AI!</p>
            
            <center>
              <a href="http://localhost:5173/billing" class="button">View Your Account</a>
            </center>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2026 Workshop AI. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, `🎉 Payment Confirmed - ${credits} Credits Added`, html);
}

module.exports = { sendEmail, sendPaymentConfirmation, sendViaResend, sendViaSendGrid, sendViaSMTP };
