import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(
    private svc: SystemService,
    private emailService: EmailService,
  ) {}

  @Public() @Get('health')
  getHealth() { return this.svc.getHealth(); }

  @Public() @Get('maintenance')
  getMaintenanceMode() { return this.svc.getMaintenanceMode(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN')
  @Post('maintenance') setMaintenanceMode(@Body() data: { isActive: boolean; message?: string }) { return this.svc.setMaintenanceMode(data.isActive, data.message); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Get('dashboard') getDashboardStats() { return this.svc.getDashboardStats(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN')
  @Get('backups') getBackups() { return this.svc.getBackups(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN')
  @Post('backups') createBackup(@Body() data: any) { return this.svc.createBackup(data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN')
  @Post('test-email')
  async testEmail(@Body() data: { email: string }) {
    const success = await this.emailService.sendTestEmail(data.email);
    return { success, message: success ? 'Test email sent successfully' : 'Failed to send test email. Check email configuration.' };
  }
}
