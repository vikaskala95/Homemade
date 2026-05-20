/**
 * Email utility - sends transactional emails.
 * In production, integrate with a service like Resend, SendGrid, or AWS SES.
 * This module provides a unified interface with console logging for development.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const APP_NAME = "Homemade Everything";
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@homemadeeverything.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    if (process.env.RESEND_API_KEY) {
      // Production: use Resend API
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
      });
      return res.ok;
    }

    // Development: log to console
    console.log(`\n📧 EMAIL SENT\nTo: ${to}\nSubject: ${subject}\nBody: ${html}\n`);
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Reset Your Password</h2>
        <p>You requested a password reset for your ${APP_NAME} account.</p>
        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const verifyUrl = `${APP_URL}/auth/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: `Verify your ${APP_NAME} email`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Verify Your Email</h2>
        <p>Welcome to ${APP_NAME}! Please verify your email address.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(email: string, orderNumber: string, total: number): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Order Confirmed - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Order Confirmed! 🎉</h2>
        <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <p>Total: <strong>₹${total.toLocaleString("en-IN")}</strong></p>
        <a href="${APP_URL}/orders" style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Track Order</a>
      </div>
    `,
  });
}

export async function sendVendorApprovalEmail(email: string, storeName: string, approved: boolean): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Vendor Application ${approved ? "Approved" : "Rejected"} - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${approved ? "#16a34a" : "#dc2626"};">${approved ? "Congratulations! 🎉" : "Application Update"}</h2>
        <p>Your vendor application for <strong>${storeName}</strong> has been <strong>${approved ? "approved" : "rejected"}</strong>.</p>
        ${approved ? `<a href="${APP_URL}/vendor/dashboard" style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Go to Dashboard</a>` : "<p>Please contact support for more information.</p>"}
      </div>
    `,
  });
}
