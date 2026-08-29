import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PressReleasesService } from './press-releases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Press Releases')
@Controller('press-releases')
export class PressReleasesController {
  constructor(private svc: PressReleasesService) {}

  @Public() @Get('public')
  findPublished(@Query() q: { page?: string; limit?: string }) {
    return this.svc.findPublished({ page: q.page ? +q.page : 1, limit: q.limit ? +q.limit : 20 });
  }

  @Public() @Get('public/:slug')
  findBySlugPublic(@Param('slug') slug: string) { return this.svc.findBySlugPublic(slug); }

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
