import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { NotificationsService } from "../notifications/notifications.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../common/dto/pagination.dto";

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  async submit(data: any, ip?: string) {
    const submission = await this.prisma.contactSubmission.create({
      data: { ...data, ipAddress: ip },
    });

    // Send notification emails (non-blocking)
    Promise.all([
      // Notify admin via email
      this.emailService.sendContactFormNotificationToAdmin({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        subject: data.subject,
        message: data.message,
      }),
      // Confirm to user via email
      this.emailService.sendContactFormConfirmationToUser({
        name: data.name,
        email: data.email,
      }),
      // Create in-app notification for admins
      this.notificationsService.notifyAdmins({
        type: 'INFO',
        title: 'New Contact Form Submission',
        message: `${data.name} submitted a contact form: ${data.subject}`,
        link: '/admin/contact',
        metadata: { submissionId: submission.id },
      }),
    ]).catch((err) => console.error('Notification error:', err));

    // Auto-create lead from contact form
    const lead = await this.prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message,
        source: "CONTACT_FORM",
        serviceInterest: data.service,
        gdprConsent: data.gdprConsent || false,
        ipAddress: ip,
      },
    });

    // Notify admin about new lead (non-blocking)
    Promise.all([
      this.emailService.sendLeadNotificationToAdmin({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message,
        serviceInterest: data.service,
        source: "CONTACT_FORM",
      }),
      this.notificationsService.notifyAdmins({
        type: 'LEAD_UPDATE',
        title: 'New Lead Generated',
        message: `New lead: ${data.name} from ${data.company || 'Unknown Company'}`,
        link: '/admin/leads',
        metadata: { leadId: lead.id },
      }),
    ]).catch((err) => console.error('Lead notification error:', err));

    return submission;
  }

  async findAll(
    query: PaginationDto & { isRead?: boolean; isResolved?: boolean },
  ) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      isRead,
      isResolved,
    } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: any = {};
    if (search)
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    if (isRead !== undefined) where.isRead = isRead;
    if (isResolved !== undefined) where.isResolved = isResolved;
    const [data, total] = await Promise.all([
      this.prisma.contactSubmission.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    const item = await this.prisma.contactSubmission.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException("Submission not found");
    return item;
  }

  async markRead(id: string) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { isRead: true },
    });
  }
  async markResolved(id: string, notes?: string) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { isResolved: true, adminNotes: notes },
    });
  }
  async remove(id: string) {
    await this.prisma.contactSubmission.delete({ where: { id } });
    return { message: "Deleted" };
  }
  async getStats() {
    const [total, unread, unresolved] = await Promise.all([
      this.prisma.contactSubmission.count(),
      this.prisma.contactSubmission.count({ where: { isRead: false } }),
      this.prisma.contactSubmission.count({ where: { isResolved: false } }),
    ]);
    return { total, unread, unresolved };
  }
}
