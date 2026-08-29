import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private svc: NewsletterService) {}

  @Public() @Post('subscribe')
  subscribe(@Body() data: { email: string; name?: string; gdprConsent?: boolean }) { return this.svc.subscribe(data); }

  @Public() @Post('unsubscribe')
  unsubscribe(@Body('email') email: string) { return this.svc.unsubscribe(email); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MARKETER')
  @Get('subscribers') findAll(@Query() q: PaginationDto & { isActive?: boolean }) { return this.svc.findAll(q); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MARKETER')
  @Get('stats') getStats() { return this.svc.getStats(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Delete('subscribers/:id') remove(@Param('id') id: string) { return this.svc.remove(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MARKETER')
  @Get('campaigns') findCampaigns(@Query() q: PaginationDto) { return this.svc.findCampaigns(q); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MARKETER')
  @Post('campaigns') createCampaign(@Body() data: any) { return this.svc.createCampaign(data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MARKETER')
  @Put('campaigns/:id') updateCampaign(@Param('id') id: string, @Body() data: any) { return this.svc.updateCampaign(id, data); }
}
