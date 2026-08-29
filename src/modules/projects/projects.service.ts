import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { status?: string; clientId?: string }) {
    const { page: _p = 1, limit: _l = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, clientId } = query;
    const page = Number(_p); const limit = Number(_l);
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder }, include: { client: { select: { id: true, name: true, logo: true } }, service: { select: { id: true, name: true } }, _count: { select: { tasks: true, milestones: true } } } }),
      this.prisma.project.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id }, include: { client: true, service: true, members: { include: { user: { select: { id: true, name: true, avatar: true, role: true } } } }, tasks: { include: { assignee: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } }, milestones: { orderBy: { order: 'asc' } }, deliverables: { orderBy: { createdAt: 'desc' } } } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(data: any) {
    const { memberIds, ...projectData } = data;
    return this.prisma.project.create({
      data: { ...projectData, members: memberIds?.length ? { create: memberIds.map((uid: string) => ({ userId: uid })) } : undefined },
      include: { client: true, members: { include: { user: { select: { id: true, name: true } } } } },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    const { memberIds, ...projectData } = data;
    if (memberIds) {
      await this.prisma.projectMember.deleteMany({ where: { projectId: id } });
      if (memberIds.length) await this.prisma.projectMember.createMany({ data: memberIds.map((uid: string) => ({ projectId: id, userId: uid })) });
    }
    return this.prisma.project.update({ where: { id }, data: projectData, include: { client: true, members: { include: { user: { select: { id: true, name: true } } } } } });
  }

  async remove(id: string) { await this.prisma.project.delete({ where: { id } }); return { message: 'Project deleted' }; }

  // Client portal
  async findByClient(userId: string) {
    return this.prisma.project.findMany({
      where: { OR: [{ client: { leads: { some: { assigneeId: userId } } } }, { members: { some: { userId } } }] },
      include: { client: { select: { id: true, name: true } }, _count: { select: { tasks: true, milestones: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Tasks
  async createTask(projectId: string, data: any) { return this.prisma.task.create({ data: { ...data, projectId } }); }
  async updateTask(id: string, data: any) { return this.prisma.task.update({ where: { id }, data }); }
  async deleteTask(id: string) { await this.prisma.task.delete({ where: { id } }); return { message: 'Task deleted' }; }

  // Milestones
  async createMilestone(projectId: string, data: any) { return this.prisma.milestone.create({ data: { ...data, projectId } }); }
  async updateMilestone(id: string, data: any) { return this.prisma.milestone.update({ where: { id }, data }); }
  async signOffMilestone(id: string) { return this.prisma.milestone.update({ where: { id }, data: { signedOff: true, signedOffAt: new Date(), status: 'COMPLETED' } }); }

  // Deliverables
  async createDeliverable(projectId: string, data: any) { return this.prisma.deliverable.create({ data: { ...data, projectId } }); }
  async deleteDeliverable(id: string) { await this.prisma.deliverable.delete({ where: { id } }); return { message: 'Deliverable deleted' }; }
}
