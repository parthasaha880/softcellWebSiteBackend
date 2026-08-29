import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SnippetsService } from './snippets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Snippets')
@Controller('snippets')
export class SnippetsController {
  constructor(private svc: SnippetsService) {}

  @Public() @Get('public')
  findAllPublic() { return this.svc.findAllPublic(); }

  @Public() @Get('public/:key')
  findByKey(@Param('key') key: string) { return this.svc.findByKey(key); }

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
