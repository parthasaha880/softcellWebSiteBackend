import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private svc: ProjectsService) {}

  @Roles('SUPERADMIN','ADMIN','MANAGER') @Get()
  findAll(@Query() q: PaginationDto & { status?: string; clientId?: string }) { return this.svc.findAll(q); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','CLIENT') @Get('my')
  findMyProjects(@CurrentUser('id') userId: string) { return this.svc.findByClient(userId); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','CLIENT') @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Roles('SUPERADMIN','ADMIN','MANAGER') @Post()
  create(@Body() data: any) { return this.svc.create(data); }

  @Roles('SUPERADMIN','ADMIN','MANAGER') @Put(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.svc.update(id, data); }

  @Roles('SUPERADMIN','ADMIN') @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }

  // Tasks
  @Roles('SUPERADMIN','ADMIN','MANAGER') @Post(':id/tasks')
  createTask(@Param('id') id: string, @Body() data: any) { return this.svc.createTask(id, data); }

  @Roles('SUPERADMIN','ADMIN','MANAGER') @Put('tasks/:taskId')
  updateTask(@Param('taskId') id: string, @Body() data: any) { return this.svc.updateTask(id, data); }

  @Roles('SUPERADMIN','ADMIN','MANAGER') @Delete('tasks/:taskId')
  deleteTask(@Param('taskId') id: string) { return this.svc.deleteTask(id); }

  // Milestones
  @Roles('SUPERADMIN','ADMIN','MANAGER') @Post(':id/milestones')
  createMilestone(@Param('id') id: string, @Body() data: any) { return this.svc.createMilestone(id, data); }

  @Roles('SUPERADMIN','ADMIN','MANAGER') @Put('milestones/:milestoneId')
  updateMilestone(@Param('milestoneId') id: string, @Body() data: any) { return this.svc.updateMilestone(id, data); }

  @Roles('SUPERADMIN','ADMIN','MANAGER','CLIENT') @Patch('milestones/:milestoneId/signoff')
  signOffMilestone(@Param('milestoneId') id: string) { return this.svc.signOffMilestone(id); }

  // Deliverables
  @Roles('SUPERADMIN','ADMIN','MANAGER') @Post(':id/deliverables')
  createDeliverable(@Param('id') id: string, @Body() data: any) { return this.svc.createDeliverable(id, data); }

  @Roles('SUPERADMIN','ADMIN','MANAGER') @Delete('deliverables/:deliverableId')
  deleteDeliverable(@Param('deliverableId') id: string) { return this.svc.deleteDeliverable(id); }
}
