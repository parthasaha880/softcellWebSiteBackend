import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(private svc: LeadsService) {}

  @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER') @Get()
  findAll(@Query() q: PaginationDto & { status?: string; source?: string; assigneeId?: string }) { return this.svc.findAll(q); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER') @Get('stats')
  getStats() { return this.svc.getStats(); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER') @Get('export')
  exportLeads() { return this.svc.export(); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER') @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER') @Post()
  create(@Body() data: any) { return this.svc.create(data); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER') @Put(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.svc.update(id, data); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER') @Post(':id/notes')
  addNote(@Param('id') id: string, @CurrentUser('id') userId: string, @Body('content') content: string) { return this.svc.addNote(id, userId, content); }

  @Roles('SUPERADMIN','ADMIN','MANAGER') @Patch(':id/assign')
  assign(@Param('id') id: string, @Body('assigneeId') assigneeId: string) { return this.svc.assign(id, assigneeId); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER') @Patch(':id/score')
  updateScore(@Param('id') id: string, @Body('score') score: number) { return this.svc.updateScore(id, score); }

  @Roles('SUPERADMIN','ADMIN') @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
