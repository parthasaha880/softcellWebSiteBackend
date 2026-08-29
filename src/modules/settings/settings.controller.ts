import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private svc: SettingsService) {}

  @Public() @Get('public')
  getPublicSettings() { return this.svc.getPublicSettings(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Get() findAll(@Query('group') group?: string) { return this.svc.findAll(group); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Get(':key') findByKey(@Param('key') key: string) { return this.svc.findByKey(key); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Put(':key') upsert(@Param('key') key: string, @Body() data: { value: string; type?: string; group?: string; label?: string }) { return this.svc.upsert(key, data.value, data.type, data.group, data.label); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Post('bulk') bulkUpdate(@Body() settings: { key: string; value: string; type?: string; group?: string; label?: string }[]) { return this.svc.bulkUpdate(settings); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN')
  @Delete(':key') remove(@Param('key') key: string) { return this.svc.remove(key); }
}
