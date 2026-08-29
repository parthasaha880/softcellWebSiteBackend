import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CareersService } from './careers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Careers')
@Controller('careers')
export class CareersController {
  constructor(private svc: CareersService) {}

  @Public() @Get('public')
  findPublished(@Query() q: PaginationDto & { department?: string; location?: string; type?: string }) { return this.svc.findPublished(q); }

  @Public() @Get('public/departments')
  getDepartments() { return this.svc.getDepartments(); }

  @Public() @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) { return this.svc.findBySlug(slug); }

  @Public() @Post('public/:slug/apply')
  apply(@Param('slug') slug: string, @Body() data: any) { return this.svc.apply(slug, data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get() findAll(@Query() q: PaginationDto & { status?: string }) { return this.svc.findAll(q); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Post() create(@Body() data: any) { return this.svc.create(data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Put(':id') update(@Param('id') id: string, @Body() data: any) { return this.svc.update(id, data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Get(':id/applications') findApplications(@Param('id') id: string) { return this.svc.findApplications(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER')
  @Patch('applications/:appId') updateApplication(@Param('appId') id: string, @Body() data: any) { return this.svc.updateApplication(id, data); }
}
