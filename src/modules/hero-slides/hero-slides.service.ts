import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HeroSlidesService {
  constructor(private prisma: PrismaService) {}

  async findPublic() {
    return this.prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAll(params?: { page?: number; limit?: number }) {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 20);
    const [data, total] = await Promise.all([
      this.prisma.heroSlide.findMany({
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.heroSlide.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const slide = await this.prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundException('Hero slide not found');
    return slide;
  }

  async create(data: any) {
    return this.prisma.heroSlide.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.heroSlide.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.heroSlide.delete({ where: { id } });
  }
}
