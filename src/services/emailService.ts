/**
 * Email Service for Payment Confirmations
 * Supports: Resend, SendGrid, Mailgun, SMTP
 * NOTE: This service is designed to be called from the backend (server.js)
 * Frontend should trigger email sending through API endpoints
 */

type EmailProvider = 'resend' | 'sendgrid' | 'mailgun' | 'smtp';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * This service is primarily for backend use.
 * Frontend uses emailService.cjs in the root directory for Express.js
 * 
 * For frontend-based email, use HTTP calls to backend endpoints instead.
 */

export function getEmailProvider(): EmailProvider {
  const env = typeof process !== 'undefined' ? process.env : ({} as any);
  if (env.RESEND_API_KEY) return 'resend';
  if (env.SENDGRID_API_KEY) return 'sendgrid';
  if (env.MAILGUN_API_KEY) return 'mailgun';
  if (env.SMTP_HOST) return 'smtp';
  return 'smtp';
}

/**
 * Payment Confirmation Email Template
 */
export function getPaymentConfirmationTemplate(
  amount: number,
  credits: number,
  creditsPackage: string
): string {
  const amountFormatted = (amount / 100).toFixed(2);
  const packageName = creditsPackage.charAt(0).toUpperCase() + creditsPackage.slice(1);

  return `
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
}

/**
 * Generation Confirmation Email Template
 */
export function getGenerationConfirmationTemplate(
  appName: string,
  creditsUsed: number,
  creditsRemaining: number
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ App Generated Successfully!</h1>
          </div>
          
          <div class="content">
            <p>Great news! Your app <strong>"${appName}"</strong> has been generated and is ready to deploy!</p>
            
            <div style="background: white; padding: 20px; border-radius: 6px;">
              <p><strong>Credits Used:</strong> ${creditsUsed}</p>
              <p><strong>Credits Remaining:</strong> ${creditsRemaining}</p>
            </div>
            
            <p>You can now:</p>
            <ul>
              <li>Preview your app in real-time</li>
              <li>Make changes and refinements</li>
              <li>Export and deploy anywhere</li>
            </ul>
            
            <center>
              <a href="http://localhost:5173/workspace" class="button">View Your App</a>
            </center>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Low Credits Warning Email Template
 */
export function getLowCreditsWarningTemplate(creditsRemaining: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Credits Balance</h1>
          </div>
          
          <div class="content">
            <p>Hi there! You're running low on credits.</p>
            
            <div style="background: white; padding: 20px; border-radius: 6px;">
              <p><strong>Credits Remaining: ${creditsRemaining}</strong></p>
            </div>
            
            <p>Don't let your ideas stop! Buy more credits now to keep building amazing apps.</p>
            
            <center>
              <a href="http://localhost:5173/billing" class="button">Buy Credits</a>
            </center>
          </div>
        </div>
      </body>
    </html>
  `;
}
