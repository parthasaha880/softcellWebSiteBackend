import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private svc: ResourcesService) {}

  @Public() @Get('public')
  findPublished(@Query() q: { type?: string; category?: string; page?: string; limit?: string }) {
    return this.svc.findPublished({ type: q.type, category: q.category, page: q.page ? +q.page : 1, limit: q.limit ? +q.limit : 20 });
  }

  @Public() @Get('public/types')
  getTypes() { return this.svc.getTypes(); }

  @Public() @Get('public/categories')
  getCategories() { return this.svc.getCategories(); }

  @Public() @Get('public/:slug')
  findBySlugPublic(@Param('slug') slug: string) { return this.svc.findBySlugPublic(slug); }

  @Public() @Patch('public/:slug/download')
  trackDownload(@Param('slug') slug: string) { return this.svc.trackDownload(slug); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Get()
  findAll(@Query() q: any) { return this.svc.findAll(q); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Post()
  create(@Body() data: any) { return this.svc.create(data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.svc.update(id, data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
