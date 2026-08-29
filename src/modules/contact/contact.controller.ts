import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Request } from 'express';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private svc: ContactService) {}

  @Public() @Post()
  submit(@Body() data: any, @Req() req: Request) { return this.svc.submit(data, req.ip); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get() findAll(@Query() q: PaginationDto & { isRead?: boolean; isResolved?: boolean }) { return this.svc.findAll(q); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get('stats') getStats() { return this.svc.getStats(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Patch(':id/read') markRead(@Param('id') id: string) { return this.svc.markRead(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Patch(':id/resolve') markResolved(@Param('id') id: string, @Body('notes') notes?: string) { return this.svc.markResolved(id, notes); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
