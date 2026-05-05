import nodemailer from 'nodemailer';

// Create Gmail transporter
const createTransporter = () => {
  const emailUser = process.env.GMAIL_EMAIL;
  const emailPass = process.env.GMAIL_APP_PASSWORD;

  if (!emailUser || !emailPass) {
    console.warn('[EMAIL] Gmail credentials not configured. Using mock mode.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string; mock?: boolean }> {
  const transporter = createTransporter();
  const emailFrom = process.env.GMAIL_EMAIL || 'noreply@midnightpizzahack.dev';

  // Mock mode if Gmail not configured
  if (!transporter) {
    console.log(`[EMAIL MOCK] Would send to ${to}: ${subject}`);
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`[EMAIL] Sent to ${to} (message ID: ${info.messageId})`);
    return { success: true };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send to ${to}:`, error);
    return { success: false, error: String(error) };
  }
}

// Optional: Send welcome email
export async function sendWelcomeEmail(teamName: string, leaderEmail: string, leaderName: string): Promise<{ success: boolean; error?: string }> {
  const subject = '🍕 Welcome to Midnight Pizza Hack!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Welcome, ${leaderName}! 🍕</h1>
      <p>Your team <strong>${teamName}</strong> is registered for Midnight Pizza Hack!</p>
      <p>Next steps:</p>
      <ul>
        <li>Complete payment (₹200) on your dashboard</li>
        <li>Wait for the problem statement to be revealed</li>
        <li>Start building at midnight!</li>
      </ul>
      <p>Log in: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://midnightpizzahack.dev'}/dashboard">Your Dashboard</a></p>
      <p>Good luck! Code. Eat. Repeat. 🌙</p>
    </div>
  `;
  return sendEmail(leaderEmail, subject, html);
}

// Optional: Send payment confirmation email
export async function sendPaymentConfirmationEmail(teamName: string, leaderEmail: string): Promise<{ success: boolean; error?: string }> {
  const subject = '💳 Payment Confirmed - Midnight Pizza Hack';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Payment Confirmed ✅</h1>
      <p>Thank you, <strong>${teamName}</strong>!</p>
      <p>Your registration payment of ₹200 has been verified and confirmed.</p>
      <p>You're all set to participate in Midnight Pizza Hack!</p>
      <p>Check your dashboard for updates: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://midnightpizzahack.dev'}/dashboard">Dashboard</a></p>
      <p>🍕 Code. Eat. Repeat.</p>
    </div>
  `;
  return sendEmail(leaderEmail, subject, html);
}

// Optional: Send submission confirmation email
export async function sendSubmissionConfirmationEmail(teamName: string, leaderEmail: string): Promise<{ success: boolean; error?: string }> {
  const subject = '📦 Submission Received - Midnight Pizza Hack';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Submission Received ✅</h1>
      <p>Thank you, <strong>${teamName}</strong>!</p>
      <p>Your project submission has been received and is now under evaluation.</p>
      <p>Results will be announced soon. Stay tuned!</p>
      <p>Check the dashboard for updates: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://midnightpizzahack.dev'}/dashboard">Dashboard</a></p>
      <p>🍕 Code. Eat. Repeat.</p>
    </div>
  `;
  return sendEmail(leaderEmail, subject, html);
}
