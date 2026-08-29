import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private svc: TestimonialsService) {}

  @Public() @Get('public')
  findPublished(@Query('category') category?: string, @Query('industry') industry?: string) { return (this.svc as any).findPublished?.(category || industry) ?? this.svc.findAll({ page: 1, limit: 100 }, { status: 'PUBLISHED' }); }

  @Public() @Get('public/featured')
  findFeatured() { return (this.svc as any).findFeatured?.() ?? this.svc.findAll({ page: 1, limit: 10 }, { status: 'PUBLISHED' }); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Get() findAll(@Query() q: PaginationDto) { return this.svc.findAll(q); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Post() create(@Body() data: any) { return this.svc.create(data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN','MANAGER','MARKETER')
  @Put(':id') update(@Param('id') id: string, @Body() data: any) { return this.svc.update(id, data); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPERADMIN','ADMIN')
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
