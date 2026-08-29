import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  async getHealth() {
    const start = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - start;
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: { status: 'connected', responseTime: dbResponseTime + 'ms' },
      memory: process.memoryUsage(),
    };
  }

  async getMaintenanceMode() {
    const mode = await this.prisma.maintenanceMode.findFirst();
    return mode || { isActive: false, message: null };
  }

  async setMaintenanceMode(isActive: boolean, message?: string) {
    const existing = await this.prisma.maintenanceMode.findFirst();
    if (existing) {
      return this.prisma.maintenanceMode.update({ where: { id: existing.id }, data: { isActive, message } });
    }
    return this.prisma.maintenanceMode.create({ data: { isActive, message } });
  }

  async getBackups() { return this.prisma.systemBackup.findMany({ orderBy: { createdAt: 'desc' } }); }
  async createBackup(data: any) { return this.prisma.systemBackup.create({ data }); }

  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period counts
    const [
      users, leads, projects, blogPosts, contacts, subscribers,
      services, products, caseStudies, teamMembers, clients, testimonials,
      totalPageViews, partners, certifications, faqItems, pressReleases, resources,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.lead.count(),
      this.prisma.project.count(),
      this.prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.contactSubmission.count({ where: { isRead: false } }),
      this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      this.prisma.service.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.product.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.caseStudy.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.teamMember.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.client.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.testimonial.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.pageView.count().catch(() => 0),
      this.prisma.partner.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.certification.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.faqItem.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.pressRelease.count({ where: { status: 'PUBLISHED' } }).catch(() => 0),
      this.prisma.resource.count({ where: { status: 'PUBLISHED' } }).catch(() => 0),
    ]);

    // Trends (last 30 days vs previous 30 days)
    const [leadsThisMonth, leadsPrevMonth, contactsThisMonth, contactsPrevMonth, subscribersThisMonth, viewsThisMonth] = await Promise.all([
      this.prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.lead.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.prisma.contactSubmission.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.contactSubmission.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.prisma.newsletterSubscriber.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }).catch(() => 0),
    ]);

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Recent activity (last 10 items from various sources)
    const [recentContacts, recentLeads, recentPosts, recentSubscribers] = await Promise.all([
      this.prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, subject: true, createdAt: true } }),
      this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, company: true, createdAt: true } }),
      this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' }, take: 5, where: { status: 'PUBLISHED' }, select: { id: true, title: true, createdAt: true } }),
      this.prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, email: true, createdAt: true } }),
    ]);

    // Merge and sort recent activity
    const recentActivity = [
      ...recentContacts.map(c => ({ type: 'contact', text: `New contact from ${c.name}: "${c.subject || 'No subject'}"`, time: c.createdAt })),
      ...recentLeads.map(l => ({ type: 'lead', text: `New lead: ${l.name}${l.company ? ` from ${l.company}` : ''}`, time: l.createdAt })),
      ...recentPosts.map(p => ({ type: 'content', text: `Blog post "${p.title}" published`, time: p.createdAt })),
      ...recentSubscribers.map(s => ({ type: 'subscriber', text: `New newsletter subscriber: ${s.email}`, time: s.createdAt })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    return {
      users,
      leads,
      projects,
      blogPosts,
      unreadContacts: contacts,
      activeSubscribers: subscribers,
      services,
      products,
      caseStudies,
      teamMembers,
      clients,
      testimonials,
      totalPageViews,
      partners,
      certifications,
      faqItems,
      pressReleases,
      resources,
      trends: {
        leads: calcTrend(leadsThisMonth, leadsPrevMonth),
        contacts: calcTrend(contactsThisMonth, contactsPrevMonth),
        subscribers: subscribersThisMonth,
        pageViews: viewsThisMonth,
      },
      recentActivity,
    };
  }
}
