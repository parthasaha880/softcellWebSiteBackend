import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(group?: string) {
    const where: any = {};
    if (group) where.group = group;
    return this.prisma.setting.findMany({ where, orderBy: { key: 'asc' } });
  }

  async findByKey(key: string) {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  async getPublicSettings() {
    return this.prisma.setting.findMany({ where: { group: { in: ['general', 'seo', 'social', 'homepage'] } }, orderBy: { key: 'asc' } });
  }

  async upsert(key: string, value: string, type = 'string', group = 'general', label?: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value, type, group, label },
      create: { key, value, type, group, label },
    });
  }

  async bulkUpdate(settings: { key: string; value: string; type?: string; group?: string; label?: string }[]) {
    const results = await Promise.all(
      settings.map(s => this.prisma.setting.upsert({
        where: { key: s.key },
        update: { value: s.value, ...(s.type && { type: s.type }), ...(s.group && { group: s.group }), ...(s.label && { label: s.label }) },
        create: { key: s.key, value: s.value, type: s.type || 'string', group: s.group || 'general', label: s.label },
      }))
    );
    return results;
  }

  async remove(key: string) {
    await this.prisma.setting.delete({ where: { key } });
    return { message: 'Setting deleted' };
  }
}
