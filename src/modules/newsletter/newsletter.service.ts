import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { NotificationsService } from "../notifications/notifications.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../common/dto/pagination.dto";

@Injectable()
export class NewsletterService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  async subscribe(data: {
    email: string;
    name?: string;
    gdprConsent?: boolean;
  }) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      if (existing.isActive) throw new ConflictException("Already subscribed");
      await this.prisma.newsletterSubscriber.update({
        where: { email: data.email },
        data: { isActive: true, unsubscribedAt: null },
      });
    } else {
      await this.prisma.newsletterSubscriber.create({
        data: { ...data, gdprConsent: data.gdprConsent || false },
      });
    }

    // Send welcome email and notify admins (non-blocking)
    Promise.all([
      this.emailService.sendNewsletterWelcome(data.email, data.name),
      this.notificationsService.notifyAdmins({
        type: "INFO",
        title: "New Newsletter Subscriber",
        message: `${data.name || data.email} subscribed to the newsletter`,
        link: "/admin/newsletter",
      }),
    ]).catch((err) => console.error("Newsletter notification error:", err));

    return this.prisma.newsletterSubscriber.findUnique({
      where: { email: data.email },
    });
  }

  async unsubscribe(email: string) {
    const sub = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    if (!sub) throw new NotFoundException("Subscriber not found");
    return this.prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });
  }

  async findAll(query: PaginationDto & { isActive?: boolean }) {
    const { page: _p = 1, limit: _l = 20, search, isActive } = query;
    const page = Number(_p);
    const limit = Number(_l);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.email = { contains: search, mode: "insensitive" };
    if (isActive !== undefined) where.isActive = isActive;
    const [data, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async remove(id: string) {
    await this.prisma.newsletterSubscriber.delete({ where: { id } });
    return { message: "Removed" };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    ]);
    return { total, active, inactive: total - active };
  }

  // Campaigns
  async findCampaigns(query: PaginationDto) {
    const { page: _p = 1, limit: _l = 20 } = query;
    const page = Number(_p);
    const limit = Number(_l);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.newsletterCampaign.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.newsletterCampaign.count(),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async createCampaign(data: any) {
    return this.prisma.newsletterCampaign.create({ data });
  }
  async updateCampaign(id: string, data: any) {
    return this.prisma.newsletterCampaign.update({ where: { id }, data });
  }
}
