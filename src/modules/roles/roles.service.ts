import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: { name: string; displayName: string; description?: string; permissions: any[] }) {
    const existing = await this.prisma.role.findUnique({ where: { name: data.name } });
    if (existing) throw new ConflictException('Role name already exists');
    return this.prisma.role.create({ data: { ...data, permissions: data.permissions as any } });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.role.update({ where: { id }, data });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if ((role as any).isSystem) throw new ConflictException('Cannot delete system role');
    await this.prisma.role.delete({ where: { id } });
    return { message: 'Role deleted successfully' };
  }
}
