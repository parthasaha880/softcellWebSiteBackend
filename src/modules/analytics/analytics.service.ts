import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private buildRealtimeIdentity(entry: {
    visitorId?: string | null;
    sessionId?: string | null;
    ipAddress?: string | null;
  }): string | null {
    if (entry.visitorId) return `visitor:${entry.visitorId}`;
    if (entry.sessionId) return `session:${entry.sessionId}`;
    if (entry.ipAddress) return `ip:${entry.ipAddress}`;
    return null;
  }

  // ========================
  // Tracking
  // ========================

  async trackPageView(data: any) {
    const pageViewData = {
      pageUrl: data?.pageUrl || "/",
      pageTitle: data?.pageTitle ?? null,
      sessionId: data?.sessionId ?? null,
      visitorId: data?.visitorId ?? null,
      ipAddress: data?.ipAddress ?? null,
      country: data?.country ?? null,
      region: data?.region ?? null,
      city: data?.city ?? null,
      device: data?.device ?? null,
      browser: data?.browser ?? null,
      os: data?.os ?? null,
      referrer: data?.referrer ?? null,
      source: data?.source ?? null,
      duration: Number.isFinite(data?.duration) ? Number(data.duration) : null,
    };

    return this.prisma.pageView.create({ data: pageViewData });
  }

  async trackEvent(data: any) {
    return this.prisma.analyticsEvent.create({ data });
  }

  // ========================
  // Overview (enhanced)
  // ========================

  async getOverview(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalViews,
      uniqueVisitors,
      topPages,
      topSources,
      geoData,
      deviceData,
      viewsLast30,
      viewsPrev30,
      visitorsLast30,
      visitorsPrev30,
      avgDuration,
      bounceCount,
    ] = await Promise.all([
      this.prisma.pageView.count({ where }),
      this.prisma.pageView
        .groupBy({ by: ["visitorId"], where, _count: true })
        .then((r) => r.length),
      this.prisma.pageView.groupBy({
        by: ["pageUrl"],
        where,
        _count: { pageUrl: true },
        orderBy: { _count: { pageUrl: "desc" } },
        take: 10,
      }),
      this.prisma.pageView.groupBy({
        by: ["source"],
        where: { ...where, source: { not: null } },
        _count: { source: true },
        orderBy: { _count: { source: "desc" } },
        take: 10,
      }),
      this.prisma.pageView.groupBy({
        by: ["country"],
        where: { ...where, country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 20,
      }),
      this.prisma.pageView.groupBy({
        by: ["device"],
        where: { ...where, device: { not: null } },
        _count: { device: true },
        orderBy: { _count: { device: "desc" } },
      }),
      // Trend comparisons
      this.prisma.pageView.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.pageView.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      this.prisma.pageView
        .groupBy({
          by: ["visitorId"],
          where: { createdAt: { gte: thirtyDaysAgo } },
          _count: true,
        })
        .then((r) => r.length),
      this.prisma.pageView
        .groupBy({
          by: ["visitorId"],
          where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
          _count: true,
        })
        .then((r) => r.length),
      // Avg session duration
      this.prisma.pageView.aggregate({
        where: { duration: { not: null } },
        _avg: { duration: true },
      }),
      // Bounce rate (sessions with only 1 page view)
      this.prisma.pageView
        .groupBy({
          by: ["sessionId"],
          where: { sessionId: { not: null } },
          _count: true,
        })
        .then((sessions) => {
          const total = sessions.length;
          const bounced = sessions.filter((s) => s._count === 1).length;
          return { total, bounced };
        }),
    ]);

    const viewsTrend =
      viewsPrev30 > 0
        ? Math.round(((viewsLast30 - viewsPrev30) / viewsPrev30) * 100)
        : viewsLast30 > 0
          ? 100
          : 0;
    const visitorsTrend =
      visitorsPrev30 > 0
        ? Math.round(((visitorsLast30 - visitorsPrev30) / visitorsPrev30) * 100)
        : visitorsLast30 > 0
          ? 100
          : 0;
    const bounceRate =
      bounceCount.total > 0
        ? Math.round((bounceCount.bounced / bounceCount.total) * 100)
        : 0;

    return {
      totalViews,
      uniqueVisitors,
      topPages,
      topSources,
      geoData,
      deviceData,
      viewsLast30,
      viewsTrend,
      visitorsLast30,
      visitorsTrend,
      avgSessionDuration: Math.round(avgDuration._avg?.duration || 0),
      bounceRate,
      totalSessions: bounceCount.total,
    };
  }

  // ========================
  // Realtime
  // ========================

  async getRealtimeUsers() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [activeViews, heartbeatEvents] = await Promise.all([
      this.prisma.pageView.findMany({
        where: { createdAt: { gte: fiveMinAgo } },
        select: {
          visitorId: true,
          sessionId: true,
          ipAddress: true,
          pageUrl: true,
          country: true,
          city: true,
          device: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.analyticsEvent.findMany({
        where: {
          createdAt: { gte: fiveMinAgo },
          name: "heartbeat",
        },
        select: {
          visitorId: true,
          sessionId: true,
          ipAddress: true,
          pageUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const latestByIdentity = new Map<
      string,
      {
        visitorId: string | null;
        pageUrl: string | null;
        country: string | null;
        city: string | null;
        device: string | null;
        createdAt: Date;
      }
    >();

    activeViews.forEach((v) => {
      const identity = this.buildRealtimeIdentity(v);
      if (!identity) return;
      if (!latestByIdentity.has(identity)) {
        latestByIdentity.set(identity, {
          visitorId: v.visitorId,
          pageUrl: v.pageUrl,
          country: v.country,
          city: v.city,
          device: v.device,
          createdAt: v.createdAt,
        });
      }
    });

    heartbeatEvents.forEach((e) => {
      const identity = this.buildRealtimeIdentity(e);
      if (!identity) return;
      if (!latestByIdentity.has(identity)) {
        latestByIdentity.set(identity, {
          visitorId: e.visitorId,
          pageUrl: e.pageUrl,
          country: null,
          city: null,
          device: null,
          createdAt: e.createdAt,
        });
      }
    });

    const activeUsers = Array.from(latestByIdentity.values()).map((u) => ({
      visitorId: u.visitorId,
      pageUrl: u.pageUrl,
      country: u.country,
      city: u.city,
      device: u.device,
    }));

    const currentPages: Record<string, number> = {};
    const liveDevices: Record<string, number> = {};
    activeUsers.forEach((v) => {
      const page = v.pageUrl || "/";
      currentPages[page] = (currentPages[page] || 0) + 1;
      const device = v.device || "Unknown";
      liveDevices[device] = (liveDevices[device] || 0) + 1;
    });

    return {
      count: activeUsers.length,
      users: activeUsers,
      currentPages: Object.entries(currentPages)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      deviceDistribution: Object.entries(liveDevices)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  // ========================
  // Traffic over time (daily trend)
  // ========================

  async getTrafficByDate(startDate: string, endDate: string) {
    const views = await this.prisma.pageView.findMany({
      where: {
        createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
      },
      select: { createdAt: true, visitorId: true, sessionId: true },
      orderBy: { createdAt: "asc" },
    });

    const grouped: Record<
      string,
      { views: number; visitors: Set<string>; sessions: Set<string> }
    > = {};
    views.forEach((v) => {
      const date = v.createdAt.toISOString().split("T")[0];
      if (!grouped[date])
        grouped[date] = { views: 0, visitors: new Set(), sessions: new Set() };
      grouped[date].views++;
      if (v.visitorId) grouped[date].visitors.add(v.visitorId);
      if (v.sessionId) grouped[date].sessions.add(v.sessionId);
    });

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      pageViews: data.views,
      uniqueVisitors: data.visitors.size,
      sessions: data.sessions.size,
    }));
  }

  // ========================
  // Device, Browser & OS Breakdown
  // ========================

  async getDeviceBreakdown() {
    const [deviceData, browserData, osData, totalCount] = await Promise.all([
      this.prisma.pageView.groupBy({
        by: ["device"],
        where: { device: { not: null } },
        _count: { device: true },
        orderBy: { _count: { device: "desc" } },
      }),
      this.prisma.pageView.groupBy({
        by: ["browser"],
        where: { browser: { not: null } },
        _count: { browser: true },
        orderBy: { _count: { browser: "desc" } },
        take: 10,
      }),
      this.prisma.pageView.groupBy({
        by: ["os"],
        where: { os: { not: null } },
        _count: { os: true },
        orderBy: { _count: { os: "desc" } },
        take: 10,
      }),
      this.prisma.pageView.count(),
    ]);

    return {
      devices: deviceData.map((d) => ({
        name: d.device || "Unknown",
        value: d._count.device,
        percentage:
          totalCount > 0 ? Math.round((d._count.device / totalCount) * 100) : 0,
      })),
      browsers: browserData.map((b) => ({
        name: b.browser || "Unknown",
        value: b._count.browser,
        percentage:
          totalCount > 0
            ? Math.round((b._count.browser / totalCount) * 100)
            : 0,
      })),
      operatingSystems: osData.map((o) => ({
        name: o.os || "Unknown",
        value: o._count.os,
        percentage:
          totalCount > 0 ? Math.round((o._count.os / totalCount) * 100) : 0,
      })),
      total: totalCount,
    };
  }

  // ========================
  // Geographic Distribution
  // ========================

  async getGeographicDistribution() {
    const [countryData, cityData, totalCount] = await Promise.all([
      this.prisma.pageView.groupBy({
        by: ["country"],
        where: { country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 20,
      }),
      this.prisma.pageView.groupBy({
        by: ["city"],
        where: { city: { not: null } },
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
        take: 20,
      }),
      this.prisma.pageView.count(),
    ]);

    return {
      countries: countryData.map((c) => ({
        name: c.country || "Unknown",
        value: c._count.country,
        percentage:
          totalCount > 0
            ? Math.round((c._count.country / totalCount) * 100)
            : 0,
      })),
      cities: cityData.map((c) => ({
        name: c.city || "Unknown",
        value: c._count.city,
        percentage:
          totalCount > 0 ? Math.round((c._count.city / totalCount) * 100) : 0,
      })),
      total: totalCount,
    };
  }

  // ========================
  // Top Pages (detailed)
  // ========================

  async getTopPages(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const pageData = await this.prisma.pageView.groupBy({
      by: ["pageUrl"],
      where: { createdAt: { gte: startDate } },
      _count: { pageUrl: true },
      _avg: { duration: true },
      orderBy: { _count: { pageUrl: "desc" } },
      take: 20,
    });

    const totalViews = pageData.reduce((sum, p) => sum + p._count.pageUrl, 0);

    return pageData.map((p) => ({
      path: p.pageUrl,
      views: p._count.pageUrl,
      avgDuration: Math.round(p._avg?.duration || 0),
      percentage:
        totalViews > 0 ? Math.round((p._count.pageUrl / totalViews) * 100) : 0,
    }));
  }

  // ========================
  // Referrer Analysis
  // ========================

  async getReferrerAnalysis() {
    const referrerData = await this.prisma.pageView.groupBy({
      by: ["referrer"],
      where: { referrer: { not: null } },
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 20,
    });

    const sourceData = await this.prisma.pageView.groupBy({
      by: ["source"],
      where: { source: { not: null } },
      _count: { source: true },
      orderBy: { _count: { source: "desc" } },
      take: 10,
    });

    const totalWithReferrer = referrerData.reduce(
      (sum, r) => sum + r._count.referrer,
      0,
    );

    return {
      referrers: referrerData.map((r) => ({
        name: r.referrer || "Direct",
        value: r._count.referrer,
        percentage:
          totalWithReferrer > 0
            ? Math.round((r._count.referrer / totalWithReferrer) * 100)
            : 0,
      })),
      sources: sourceData.map((s) => ({
        name: s.source || "Direct",
        value: s._count.source,
      })),
    };
  }

  // ========================
  // User Growth Trends
  // ========================

  async getUserGrowth(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: "asc" },
    });

    const baseCount = await this.prisma.user.count({
      where: { createdAt: { lt: startDate } },
    });

    const grouped: Record<string, any[]> = {};
    users.forEach((u) => {
      const date = u.createdAt.toISOString().split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(u);
    });

    let cumulative = baseCount;
    return Object.entries(grouped).map(([date, items]) => {
      cumulative += items.length;
      return { date, newUsers: items.length, totalUsers: cumulative };
    });
  }

  // ========================
  // Content Creation Trends
  // ========================

  async getContentTrends(months: number = 6) {
    const results = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );

      const [blogPosts, projects, leads, contacts, subscribers] =
        await Promise.all([
          this.prisma.blogPost.count({
            where: { createdAt: { gte: monthStart, lte: monthEnd } },
          }),
          this.prisma.project.count({
            where: { createdAt: { gte: monthStart, lte: monthEnd } },
          }),
          this.prisma.lead.count({
            where: { createdAt: { gte: monthStart, lte: monthEnd } },
          }),
          this.prisma.contactSubmission.count({
            where: { createdAt: { gte: monthStart, lte: monthEnd } },
          }),
          this.prisma.newsletterSubscriber.count({
            where: { createdAt: { gte: monthStart, lte: monthEnd } },
          }),
        ]);

      results.push({
        month: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        blogPosts,
        projects,
        leads,
        contacts,
        subscribers,
      });
    }

    return results;
  }

  // ========================
  // Conversion Funnel
  // ========================

  async getConversionFunnel() {
    const [totalVisitors, contactSubmissions, leads, qualifiedLeads, projects] =
      await Promise.all([
        this.prisma.pageView
          .groupBy({ by: ["visitorId"], _count: true })
          .then((r) => r.length),
        this.prisma.contactSubmission.count(),
        this.prisma.lead.count(),
        this.prisma.lead.count({
          where: { status: { in: ["QUALIFIED", "WON"] } },
        }),
        this.prisma.project.count(),
      ]);

    return [
      { stage: "Visitors", value: totalVisitors, color: "#3b82f6" },
      {
        stage: "Contact Submissions",
        value: contactSubmissions,
        color: "#8b5cf6",
      },
      { stage: "Leads", value: leads, color: "#f59e0b" },
      { stage: "Qualified Leads", value: qualifiedLeads, color: "#10b981" },
      { stage: "Projects", value: projects, color: "#06b6d4" },
    ];
  }

  // ========================
  // Monthly Overview (multi-metric)
  // ========================

  async getMonthlyOverview(months: number = 6) {
    const results = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );
      const dateFilter = { gte: monthStart, lte: monthEnd };

      const [pageViews, users, contacts, leads, blogPosts] = await Promise.all([
        this.prisma.pageView.count({ where: { createdAt: dateFilter } }),
        this.prisma.user.count({ where: { createdAt: dateFilter } }),
        this.prisma.contactSubmission.count({
          where: { createdAt: dateFilter },
        }),
        this.prisma.lead.count({ where: { createdAt: dateFilter } }),
        this.prisma.blogPost.count({ where: { createdAt: dateFilter } }),
      ]);

      results.push({
        month: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        pageViews,
        users,
        contacts,
        leads,
        blogPosts,
      });
    }

    return results;
  }

  // ========================
  // Event Analytics
  // ========================

  async getEventAnalytics(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await this.prisma.analyticsEvent.groupBy({
      by: ["name"],
      where: { createdAt: { gte: startDate } },
      _count: { name: true },
      orderBy: { _count: { name: "desc" } },
      take: 20,
    });

    const categoryData = await this.prisma.analyticsEvent.groupBy({
      by: ["category"],
      where: { createdAt: { gte: startDate }, category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 10,
    });

    const totalEvents = await this.prisma.analyticsEvent.count({
      where: { createdAt: { gte: startDate } },
    });

    // Daily event trend
    const dailyEvents = await this.prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyGrouped: Record<string, number> = {};
    dailyEvents.forEach((e) => {
      const date = e.createdAt.toISOString().split("T")[0];
      dailyGrouped[date] = (dailyGrouped[date] || 0) + 1;
    });

    return {
      totalEvents,
      topEvents: events.map((e) => ({ name: e.name, count: e._count.name })),
      categories: categoryData.map((c) => ({
        name: c.category || "Uncategorized",
        count: c._count.category,
      })),
      dailyTrend: Object.entries(dailyGrouped).map(([date, count]) => ({
        date,
        count,
      })),
    };
  }

  // ========================
  // Engagement Metrics
  // ========================

  async getEngagementMetrics(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const views = await this.prisma.pageView.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        visitorId: true,
        sessionId: true,
        duration: true,
        pageUrl: true,
        createdAt: true,
      },
    });

    // Pages per session
    const sessionPages: Record<string, number> = {};
    views.forEach((v) => {
      if (v.sessionId) {
        sessionPages[v.sessionId] = (sessionPages[v.sessionId] || 0) + 1;
      }
    });
    const sessionCounts = Object.values(sessionPages);
    const avgPagesPerSession =
      sessionCounts.length > 0
        ? Math.round(
            (sessionCounts.reduce((a, b) => a + b, 0) / sessionCounts.length) *
              10,
          ) / 10
        : 0;

    // Session duration distribution
    const durationsWithValue = views.filter(
      (v) => v.duration && v.duration > 0,
    );
    const durationBuckets = {
      "0-10s": 0,
      "10-30s": 0,
      "30-60s": 0,
      "1-3m": 0,
      "3-5m": 0,
      "5m+": 0,
    };
    durationsWithValue.forEach((v) => {
      const d = v.duration!;
      if (d <= 10) durationBuckets["0-10s"]++;
      else if (d <= 30) durationBuckets["10-30s"]++;
      else if (d <= 60) durationBuckets["30-60s"]++;
      else if (d <= 180) durationBuckets["1-3m"]++;
      else if (d <= 300) durationBuckets["3-5m"]++;
      else durationBuckets["5m+"]++;
    });

    // Returning vs new visitors
    const visitorViewCounts: Record<string, number> = {};
    views.forEach((v) => {
      if (v.visitorId) {
        visitorViewCounts[v.visitorId] =
          (visitorViewCounts[v.visitorId] || 0) + 1;
      }
    });
    const totalVisitors = Object.keys(visitorViewCounts).length;
    const returningVisitors = Object.values(visitorViewCounts).filter(
      (c) => c > 1,
    ).length;
    const newVisitors = totalVisitors - returningVisitors;

    // Hourly distribution
    const hourlyDistribution: number[] = new Array(24).fill(0);
    views.forEach((v) => {
      const hour = new Date(v.createdAt).getHours();
      hourlyDistribution[hour]++;
    });

    // Day of week distribution
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayDistribution: number[] = new Array(7).fill(0);
    views.forEach((v) => {
      const day = new Date(v.createdAt).getDay();
      dayDistribution[day]++;
    });

    return {
      avgPagesPerSession,
      sessionDurationDistribution: Object.entries(durationBuckets).map(
        ([range, count]) => ({ range, count }),
      ),
      visitorTypes: [
        { name: "New Visitors", value: newVisitors },
        { name: "Returning Visitors", value: returningVisitors },
      ],
      hourlyDistribution: hourlyDistribution.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        views: count,
      })),
      dayOfWeekDistribution: dayDistribution.map((count, idx) => ({
        day: dayNames[idx],
        views: count,
      })),
      totalSessions: sessionCounts.length,
      totalVisitors,
    };
  }

  // ========================
  // Real-time Metrics
  // ========================

  async getRealTimeMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [
      liveVisitors,
      viewsLastHour,
      contactsLastHour,
      leadsLastHour,
      newUsersLastHour,
      pendingLeads,
      unreadContacts,
    ] = await Promise.all([
      Promise.all([
        this.prisma.pageView.findMany({
          where: { createdAt: { gte: fiveMinAgo } },
          select: { visitorId: true, sessionId: true, ipAddress: true },
        }),
        this.prisma.analyticsEvent.findMany({
          where: {
            createdAt: { gte: fiveMinAgo },
            name: "heartbeat",
          },
          select: { visitorId: true, sessionId: true, ipAddress: true },
        }),
      ]).then(([views, heartbeats]) => {
        const identities = new Set<string>();
        [...views, ...heartbeats].forEach((item) => {
          const identity = this.buildRealtimeIdentity(item);
          if (identity) identities.add(identity);
        });
        return identities.size;
      }),
      this.prisma.pageView.count({ where: { createdAt: { gte: oneHourAgo } } }),
      this.prisma.contactSubmission.count({
        where: { createdAt: { gte: oneHourAgo } },
      }),
      this.prisma.lead.count({ where: { createdAt: { gte: oneHourAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: oneHourAgo } } }),
      this.prisma.lead.count({ where: { status: "NEW" } }),
      this.prisma.contactSubmission.count({ where: { isRead: false } }),
    ]);

    return {
      timestamp: now.toISOString(),
      liveVisitors,
      lastHour: {
        pageViews: viewsLastHour,
        contacts: contactsLastHour,
        leads: leadsLastHour,
        newUsers: newUsersLastHour,
      },
      alerts: { pendingLeads, unreadContacts },
    };
  }
}
