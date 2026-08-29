import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  findAll() { return this.rolesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.rolesService.findOne(id); }

  @Post()
  create(@Body() data: any) { return this.rolesService.create(data); }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.rolesService.update(id, data); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.rolesService.remove(id); }
}
