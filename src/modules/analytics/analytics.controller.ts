import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private svc: AnalyticsService) {}

  // Public tracking endpoints
  @Public() @Post('track/pageview')
  trackPageView(@Body() data: any, @Req() req: Request) { return this.svc.trackPageView({ ...data, ipAddress: req.ip, userAgent: req.headers['user-agent'] }); }

  @Public() @Post('track/event')
  trackEvent(@Body() data: any, @Req() req: Request) { return this.svc.trackEvent({ ...data, ipAddress: req.ip }); }

  // Overview
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('overview')
  getOverview(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.svc.getOverview(startDate, endDate);
  }

  // Realtime
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('realtime')
  getRealtimeUsers() { return this.svc.getRealtimeUsers(); }

  // Traffic over time
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('traffic')
  getTrafficByDate(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.svc.getTrafficByDate(startDate, endDate);
  }

  // Device, Browser & OS Breakdown
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('device-breakdown')
  getDeviceBreakdown() { return this.svc.getDeviceBreakdown(); }

  // Geographic Distribution
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('geographic')
  getGeographicDistribution() { return this.svc.getGeographicDistribution(); }

  // Top Pages
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('top-pages')
  getTopPages(@Query('days') days?: string) { return this.svc.getTopPages(days ? parseInt(days) : 30); }

  // Referrer Analysis
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('referrers')
  getReferrerAnalysis() { return this.svc.getReferrerAnalysis(); }

  // User Growth
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('user-growth')
  getUserGrowth(@Query('days') days?: string) { return this.svc.getUserGrowth(days ? parseInt(days) : 30); }

  // Content Trends
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('content-trends')
  getContentTrends(@Query('months') months?: string) { return this.svc.getContentTrends(months ? parseInt(months) : 6); }

  // Conversion Funnel
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('conversion-funnel')
  getConversionFunnel() { return this.svc.getConversionFunnel(); }

  // Monthly Overview
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('monthly-overview')
  getMonthlyOverview(@Query('months') months?: string) { return this.svc.getMonthlyOverview(months ? parseInt(months) : 6); }

  // Event Analytics
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('events')
  getEventAnalytics(@Query('days') days?: string) { return this.svc.getEventAnalytics(days ? parseInt(days) : 30); }

  // Engagement Metrics
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('engagement')
  getEngagementMetrics(@Query('days') days?: string) { return this.svc.getEngagementMetrics(days ? parseInt(days) : 30); }

  // Real-time Metrics
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('realtime-metrics')
  getRealTimeMetrics() { return this.svc.getRealTimeMetrics(); }
}
