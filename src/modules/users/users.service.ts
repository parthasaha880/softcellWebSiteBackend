import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { role?: string; isActive?: boolean }) {
    const { page: _p = 1, limit: _l = 20, search, sortBy = 'createdAt', sortOrder = 'desc', role, isActive } = query;
    const page = Number(_p); const limit = Number(_l);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true, email: true, name: true, avatar: true, phone: true,
          jobTitle: true, department: true, role: true, isActive: true,
          lastLoginAt: true, createdAt: true, updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, avatar: true, phone: true,
        jobTitle: true, department: true, bio: true, role: true,
        isActive: true, isEmailVerified: true, lastLoginAt: true,
        preferences: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: {
    email: string; password: string; name: string; role?: string;
    phone?: string; jobTitle?: string; department?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(data.password, 12);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword, role: (data.role as any) || 'CLIENT' },
      select: {
        id: true, email: true, name: true, role: true, isActive: true, createdAt: true,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, name: true, avatar: true, phone: true,
        jobTitle: true, department: true, role: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !(user as any).isActive },
      select: { id: true, isActive: true },
    });
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findOne(id);
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword, passwordChangedAt: new Date() },
    });
    return { message: 'Password reset successfully' };
  }

  async getActivityLogs(userId: string, query: PaginationDto) {
    const { page: _p = 1, limit: _l = 20 } = query;
    const page = Number(_p); const limit = Number(_l);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where: { userId } }),
    ]);

    return new PaginatedResult(data, total, page, limit);
  }
}
