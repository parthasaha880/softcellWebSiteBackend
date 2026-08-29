import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;
  private fromName: string = "SoftCell Technologies";

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const host = this.configService.get<string>("SMTP_HOST");
      const port = this.configService.get<number>("SMTP_PORT", 587);
      const secure =
        this.configService.get<string>("SMTP_SECURE", "false") === "true";
      const user = this.configService.get<string>("SMTP_USER");
      const pass = this.configService.get<string>("SMTP_PASS");
      const fromEmail = this.configService.get<string>(
        "EMAIL_FROM_EMAIL",
        "noreply@softcellbd.net",
      );
      const fromName = this.configService.get<string>(
        "EMAIL_FROM_NAME",
        "SoftCell Technologies",
      );
      this.fromEmail = fromEmail;
      this.fromName = fromName;

      if (!host || !user || !pass) {
        this.logger.warn(
          "Email service not fully configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env",
        );
        return;
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      this.logger.log("Email transporter initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize email transporter", error);
    }
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn(
          `Email not sent (transporter not configured). To: ${options.to}, Subject: ${options.subject}`,
        );
        return false;
      }

      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html || options.text,
        text: options.text,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo || this.fromEmail,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${options.to}: ${options.subject}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  // Newsletter subscription confirmation
  async sendNewsletterWelcome(to: string, name?: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Welcome to SoftCell Newsletter!</h2>
        <p>Hello ${name || "Subscriber"},</p>
        <p>Thank you for subscribing to our newsletter. You'll now receive the latest updates, insights, and announcements from SoftCell Technologies.</p>
        <p style="margin-top: 30px; color: #64748b;">
          If you no longer wish to receive emails from us, you can unsubscribe at any time.
        </p>
        <p style="margin-top: 30px; color: #94a3b8; font-size: 12px;">
          SoftCell Technologies<br>
          Enterprise Software & AI Solutions
        </p>
      </div>
    `;

    return this.send({
      to,
      subject: "Welcome to SoftCell Newsletter",
      html,
    });
  }

  // Contact form submission - notification to admin
  async sendContactFormNotificationToAdmin(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const adminEmail = this.configService.get<string>(
      "ADMIN_EMAIL",
      "admin@softcellbd.net",
    );

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">New Contact Form Submission</h2>
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
          ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ""}
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-left: 4px solid #0ea5e9;">${data.message}</p>
        </div>
        <p style="margin-top: 20px;">
          <a href="http://localhost:3000/admin/contact" style="background-color: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View in Admin Panel</a>
        </p>
      </div>
    `;

    return this.send({
      to: adminEmail,
      subject: `New Contact: ${data.subject}`,
      html,
      replyTo: data.email,
    });
  }

  // Contact form submission - confirmation to user
  async sendContactFormConfirmationToUser(data: {
    name: string;
    email: string;
  }): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Thank You for Contacting Us</h2>
        <p>Hello ${data.name},</p>
        <p>We've received your contact form submission. Our team will get back to you shortly.</p>
        <p style="margin-top: 20px; color: #64748b;">
          We typically respond within 24-48 business hours.
        </p>
        <p style="margin-top: 30px; color: #94a3b8; font-size: 12px;">
          SoftCell Technologies<br>
          Enterprise Software & AI Solutions
        </p>
      </div>
    `;

    return this.send({
      to: data.email,
      subject: "We Received Your Contact Form",
      html,
    });
  }

  // New lead notification to admin
  async sendLeadNotificationToAdmin(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
    serviceInterest?: string;
    source?: string;
  }): Promise<boolean> {
    const adminEmail = this.configService.get<string>(
      "ADMIN_EMAIL",
      "admin@softcellbd.net",
    );

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">New Lead Generated</h2>
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
          ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ""}
          ${data.serviceInterest ? `<p><strong>Service Interest:</strong> ${data.serviceInterest}</p>` : ""}
          ${data.source ? `<p><strong>Source:</strong> ${data.source}</p>` : ""}
          ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ""}
        </div>
        <p style="margin-top: 20px;">
          <a href="http://localhost:3000/admin/leads" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View in Leads Dashboard</a>
        </p>
      </div>
    `;

    return this.send({
      to: adminEmail,
      subject: `New Lead: ${data.name} (${data.serviceInterest || "Unspecified"})`,
      html,
      replyTo: data.email,
    });
  }

  // Lead confirmation to user
  async sendLeadConfirmationToUser(data: {
    name: string;
    email: string;
  }): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Thank You for Your Interest</h2>
        <p>Hello ${data.name},</p>
        <p>Thank you for showing interest in SoftCell Technologies. We'll be in touch with you shortly.</p>
        <p style="margin-top: 20px; color: #64748b;">
          Our team will review your information and reach out to discuss how we can help with your enterprise software needs.
        </p>
        <p style="margin-top: 30px; color: #94a3b8; font-size: 12px;">
          SoftCell Technologies<br>
          Enterprise Software & AI Solutions
        </p>
      </div>
    `;

    return this.send({
      to: data.email,
      subject: "Thank You for Your Interest in SoftCell",
      html,
    });
  }

  // Test email
  async sendTestEmail(to: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <h2 style="color: #10b981;">✓ Email Configuration Test Successful</h2>
        <p>This is a test email from SoftCell Technologies email service.</p>
        <p style="margin-top: 20px; padding: 15px; background-color: #d1fae5; border-left: 4px solid #10b981;">
          Your email service is working correctly and ready to send notifications.
        </p>
        <p style="margin-top: 30px; color: #94a3b8; font-size: 12px;">
          Email sent at: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    return this.send({
      to,
      subject: "SoftCell Email Service Test",
      html,
    });
  }
}
