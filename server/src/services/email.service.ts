import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env';

export interface SendEmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const emailService = {
  async send(payload: SendEmailPayload): Promise<void> {
    if (env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY) {
      const resend = new Resend(env.RESEND_API_KEY);
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });
      return;
    }

    if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
      });
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });
      return;
    }

    // Development / console fallback
    console.log(`[EmailService:Console] To: ${payload.to} | Subject: ${payload.subject}\n${payload.text}`);
  },

  async sendRecoveryOtp(email: string, otp: string): Promise<void> {
    await this.send({
      to: email,
      subject: `${env.APP_NAME} — Application Tracking Verification Code`,
      text: `Your 6-digit verification code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, please ignore this email.`,
      html: `<p>Your 6-digit verification code for <strong>${env.APP_NAME}</strong> is:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`,
    });
  },

  async sendInquiryConfirmation(email: string, referenceNumber: string, studentName: string): Promise<void> {
    await this.send({
      to: email,
      subject: `${env.APP_NAME} — Inquiry Received (${referenceNumber})`,
      text: `Hello ${studentName},\n\nThank you for contacting ${env.APP_NAME}. Your inquiry reference number is ${referenceNumber}.\nYou can track your application anytime at ${env.AUTH_URL}/track.`,
      html: `<p>Hello ${studentName},</p><p>Thank you for contacting <strong>${env.APP_NAME}</strong>. Your inquiry reference number is <strong>${referenceNumber}</strong>.</p><p>Track your application anytime at <a href="${env.AUTH_URL}/track">${env.AUTH_URL}/track</a>.</p>`,
    });
  },

  async sendStatusUpdate(email: string, referenceNumber: string, statusLabel: string): Promise<void> {
    await this.send({
      to: email,
      subject: `${env.APP_NAME} — Application Status Updated (${referenceNumber})`,
      text: `Your application (${referenceNumber}) status has been updated to: ${statusLabel}.\nVisit ${env.AUTH_URL}/track for full timeline details.`,
      html: `<p>Your application (<strong>${referenceNumber}</strong>) status has been updated to: <strong>${statusLabel}</strong>.</p><p>Visit <a href="${env.AUTH_URL}/track">${env.AUTH_URL}/track</a> for full timeline details.</p>`,
    });
  },
};
