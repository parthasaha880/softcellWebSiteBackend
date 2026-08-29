import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles('SUPERADMIN', 'ADMIN')
  @Get()
  findAll(@Query() query: PaginationDto & { role?: string; isActive?: boolean }) {
    return this.usersService.findAll(query);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Post()
  create(@Body() data: any) {
    return this.usersService.create(data);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Roles('SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.usersService.resetPassword(id, password);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Get(':id/activity')
  getActivityLogs(@Param('id') id: string, @Query() query: PaginationDto) {
    return this.usersService.getActivityLogs(id, query);
  }
}
