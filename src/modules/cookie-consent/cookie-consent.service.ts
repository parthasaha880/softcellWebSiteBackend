import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CookieConsentService {
  constructor(private prisma: PrismaService) {}

  async saveConsent(data: {
    visitorId: string;
    necessary?: boolean;
    analytics?: boolean;
    marketing?: boolean;
    preferences?: boolean;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const existing = await this.prisma.cookieConsent.findFirst({
      where: { visitorId: data.visitorId },
      orderBy: { consentedAt: 'desc' },
    });

    if (existing) {
      return this.prisma.cookieConsent.update({
        where: { id: existing.id },
        data: {
          necessary: data.necessary ?? true,
          analytics: data.analytics ?? false,
          marketing: data.marketing ?? false,
          preferences: data.preferences ?? false,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    }

    return this.prisma.cookieConsent.create({
      data: {
        visitorId: data.visitorId,
        necessary: data.necessary ?? true,
        analytics: data.analytics ?? false,
        marketing: data.marketing ?? false,
        preferences: data.preferences ?? false,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getConsent(visitorId: string) {
    return this.prisma.cookieConsent.findFirst({
      where: { visitorId },
      orderBy: { consentedAt: 'desc' },
    });
  }

  // Admin stats
  async getStats() {
    const total = await this.prisma.cookieConsent.count();
    const analyticsAccepted = await this.prisma.cookieConsent.count({ where: { analytics: true } });
    const marketingAccepted = await this.prisma.cookieConsent.count({ where: { marketing: true } });
    const preferencesAccepted = await this.prisma.cookieConsent.count({ where: { preferences: true } });
    return {
      total,
      analyticsAccepted,
      marketingAccepted,
      preferencesAccepted,
      analyticsRate: total > 0 ? Math.round((analyticsAccepted / total) * 100) : 0,
      marketingRate: total > 0 ? Math.round((marketingAccepted / total) * 100) : 0,
    };
  }
}
