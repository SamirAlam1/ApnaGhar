/**
 * backend/utils/email.js
 *
 * Email sender using Nodemailer with Gmail SMTP (free).
 *
 * Required .env variables:
 *   SMTP_HOST     – e.g. smtp.gmail.com
 *   SMTP_PORT     – e.g. 587
 *   SMTP_USER     – your Gmail address
 *   SMTP_PASS     – Gmail App Password (not your account password)
 *   EMAIL_FROM    – e.g. "ApnaGhar <noreply@gmail.com>"
 *   CLIENT_URL    – e.g. http://localhost:5173 (for links in emails)
 */

const nodemailer = require('nodemailer');

// ─── Transporter ─────────────────────────────────────────────────────────────
let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

// ─── Base HTML template ───────────────────────────────────────────────────────
function htmlWrapper(title, bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af,#0d9488);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                🏡 ApnaGhar
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                India's Trusted Real Estate Marketplace
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} ApnaGhar. Made with ❤️ in India 🇮🇳
              </p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;">
                If you didn't create an account with us, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send verification email ──────────────────────────────────────────────────
async function sendVerificationEmail(to, name, rawToken) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

  const body = `
    <h2 style="color:#1f2937;font-size:22px;margin:0 0 12px;">Verify Your Email Address</h2>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hi <strong>${name}</strong>, welcome to ApnaGhar! Please confirm your email address
      by clicking the button below. The link expires in <strong>24 hours</strong>.
    </p>
    <div style="text-align:center;margin:0 0 28px;">
      <a href="${verifyUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#1e40af,#0d9488);
                color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;
                font-weight:700;font-size:15px;letter-spacing:0.3px;">
        ✅ Verify Email Address
      </a>
    </div>
    <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">
      Or copy and paste this URL into your browser:
    </p>
    <p style="color:#1e40af;font-size:12px;word-break:break-all;margin:0;">
      ${verifyUrl}
    </p>`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"ApnaGhar" <noreply@apnaghar.in>',
    to,
    subject: '✅ Verify your ApnaGhar account',
    html: htmlWrapper('Verify Email — ApnaGhar', body),
  });
}

// ─── Send password reset email ────────────────────────────────────────────────
async function sendPasswordResetEmail(to, name, rawToken) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  const body = `
    <h2 style="color:#1f2937;font-size:22px;margin:0 0 12px;">Reset Your Password</h2>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hi <strong>${name}</strong>, we received a request to reset your ApnaGhar password.
      Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
    </p>
    <div style="text-align:center;margin:0 0 28px;">
      <a href="${resetUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#dc2626,#b91c1c);
                color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;
                font-weight:700;font-size:15px;letter-spacing:0.3px;">
        🔐 Reset Password
      </a>
    </div>
    <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">
      Or copy and paste this URL into your browser:
    </p>
    <p style="color:#1e40af;font-size:12px;word-break:break-all;margin:0;">
      ${resetUrl}
    </p>
    <p style="color:#ef4444;font-size:13px;margin:24px 0 0;">
      ⚠️ If you didn't request a password reset, please ignore this email.
      Your password will remain unchanged.
    </p>`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"ApnaGhar" <noreply@apnaghar.in>',
    to,
    subject: '🔐 Reset your ApnaGhar password',
    html: htmlWrapper('Reset Password — ApnaGhar', body),
  });
}

// ─── Send welcome email (after verification) ──────────────────────────────────
async function sendWelcomeEmail(to, name) {
  const body = `
    <h2 style="color:#1f2937;font-size:22px;margin:0 0 12px;">
      🎉 Welcome to ApnaGhar, ${name}!
    </h2>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Your email has been verified and your account is now fully active.
      You can now access all features of India's most trusted real estate platform.
    </p>
    <ul style="color:#4b5563;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
      <li>🏠 Browse 10,000+ verified properties</li>
      <li>🤖 AI-powered property recommendations</li>
      <li>🔖 Save properties to your wishlist</li>
      <li>📞 Connect directly with sellers</li>
    </ul>
    <div style="text-align:center;">
      <a href="${process.env.CLIENT_URL}"
         style="display:inline-block;background:linear-gradient(135deg,#1e40af,#0d9488);
                color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;
                font-weight:700;font-size:15px;">
        🏡 Start Exploring
      </a>
    </div>`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || '"ApnaGhar" <noreply@apnaghar.in>',
    to,
    subject: '🎉 Welcome to ApnaGhar — Your account is ready!',
    html: htmlWrapper('Welcome to ApnaGhar', body),
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};