import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @Public()
  @Get('public')
  findPublished() { return this.pagesService.findPublished(); }

  @Public()
  @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) { return this.pagesService.findBySlug(slug); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Get()
  findAll(@Query() query: PaginationDto & { status?: string }) { return this.pagesService.findAll(query); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Get(':id')
  findOne(@Param('id') id: string) { return this.pagesService.findOne(id); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Post()
  create(@Body() data: any, @CurrentUser('id') userId: string) { return this.pagesService.create(data, userId); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser('id') userId: string) { return this.pagesService.update(id, data, userId); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.pagesService.remove(id); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) { return this.pagesService.duplicate(id); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Get(':id/versions')
  getVersions(@Param('id') id: string) { return this.pagesService.getVersions(id); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN', 'ADMIN', 'MANAGER', 'MARKETER')
  @Post(':id/revert/:versionId')
  revertToVersion(@Param('id') id: string, @Param('versionId') versionId: string) { return this.pagesService.revertToVersion(id, versionId); }
}
