// FILE: lib/email.js
// Assignment requirement: Email on lead creation & assignment
// Setup: add SMTP vars to .env.local (see bottom of file)

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email notification when a new lead is created.
 * @param {object} lead - The newly created lead document
 * @param {string} adminEmail - Admin's email address
 */
export async function sendLeadCreatedEmail(lead, adminEmail) {
  if (!process.env.SMTP_USER) return; // Skip if SMTP not configured

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #818cf8; margin-top: 0;">🏠 New Lead Created</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 0.5rem 0; color: #94a3b8; width: 140px;">Name</td><td style="color: #f1f5f9; font-weight: 600;">${lead.name}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Email</td><td style="color: #f1f5f9;">${lead.email}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Phone</td><td style="color: #f1f5f9;">${lead.phone || "N/A"}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Property</td><td style="color: #f1f5f9;">${lead.propertyInterest}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Budget</td><td style="color: #f1f5f9;">PKR ${lead.budget?.toLocaleString()}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Priority</td>
          <td style="font-weight: 700; color: ${lead.score === "High" ? "#ef4444" : lead.score === "Medium" ? "#f59e0b" : "#22c55e"};">
            ${lead.score}
          </td>
        </tr>
      </table>
      <p style="color: #475569; font-size: 0.85rem; margin-top: 1.5rem;">PropertyCRM · ${new Date().toLocaleString("en-PK")}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"PropertyCRM" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🏠 New Lead: ${lead.name} (${lead.score} Priority)`,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}

/**
 * Send email notification when a lead is assigned to an agent.
 * @param {object} lead - The lead document
 * @param {object} agent - The assigned agent { name, email }
 */
export async function sendLeadAssignedEmail(lead, agent) {
  if (!process.env.SMTP_USER) return;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #818cf8; margin-top: 0;">📋 Lead Assigned to You</h2>
      <p style="color: #94a3b8;">Hi <strong style="color:#f1f5f9;">${agent.name}</strong>, a new lead has been assigned to you:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 0.5rem 0; color: #94a3b8; width: 140px;">Client Name</td><td style="color: #f1f5f9; font-weight: 600;">${lead.name}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Email</td><td style="color: #f1f5f9;">${lead.email}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Phone</td><td style="color: #f1f5f9;">${lead.phone || "N/A"}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Property</td><td style="color: #f1f5f9;">${lead.propertyInterest}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Budget</td><td style="color: #f1f5f9;">PKR ${lead.budget?.toLocaleString()}</td></tr>
        <tr><td style="padding: 0.5rem 0; color: #94a3b8;">Priority</td>
          <td style="font-weight: 700; color: ${lead.score === "High" ? "#ef4444" : lead.score === "Medium" ? "#f59e0b" : "#22c55e"};">
            ${lead.score}
          </td>
        </tr>
      </table>
      <p style="color: #475569; font-size: 0.85rem; margin-top: 1.5rem;">PropertyCRM · ${new Date().toLocaleString("en-PK")}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"PropertyCRM" <${process.env.SMTP_USER}>`,
      to: agent.email,
      subject: `📋 Lead Assigned: ${lead.name}`,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}