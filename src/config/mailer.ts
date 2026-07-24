import nodemailer from "nodemailer";
import { env } from "./env";

const smtpConfigured = Boolean(env.smtp.host);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user
        ? { user: env.smtp.user, pass: env.smtp.pass }
        : undefined,
    })
  : null;

export const isSmtpConfigured = smtpConfigured;

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  if (!transporter) {
    // Dev fallback: log the email so verification/reset flows remain usable
    // eslint-disable-next-line no-console
    console.log("[mailer:dev]", {
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const link = `${env.clientUrl}/verify-email?token=${encodeURIComponent(token)}`;
  await sendMail({
    to,
    subject: "Verify your Misfit email",
    text: `Verify your email: ${link}`,
    html: `<p>Welcome to Misfit.</p><p><a href="${link}">Verify your email</a></p><p>Or copy this link: ${link}</p>`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const link = `${env.clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
    to,
    subject: "Reset your Misfit password",
    text: `Reset your password: ${link}`,
    html: `<p>You requested a password reset.</p><p><a href="${link}">Reset password</a></p><p>Or copy this link: ${link}</p>`,
  });
}
