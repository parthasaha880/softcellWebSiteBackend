import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CookieConsentService } from './cookie-consent.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Cookie Consent')
@Controller('cookie-consent')
export class CookieConsentController {
  constructor(private svc: CookieConsentService) {}

  @Public() @Post()
  saveConsent(@Body() data: any, @Req() req: Request) {
    return this.svc.saveConsent({
      ...data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Public() @Get()
  getConsent(@Query('visitorId') visitorId: string) {
    return this.svc.getConsent(visitorId);
  }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN', 'ADMIN')
  @Get('stats')
  getStats() { return this.svc.getStats(); }
}
